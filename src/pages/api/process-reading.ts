import type { APIRoute } from 'astro';
import sql from '../../lib/db';
import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';

export const config = {
  maxDuration: 300,
};

import { sendAdminAlert, isModelDeprecatedError, isLowCreditError } from '../../lib/adminAlert';
import skillTemplate from '../../lib/skill.md?raw';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Parse QStash payload
    const body = await request.json();
    const { report_id } = body;

    if (!report_id) {
      return new Response(JSON.stringify({ error: 'Missing report_id' }), { status: 400 });
    }

    // 2. Fetch Report & Profile from Database
    const reports = await sql`
      SELECT r.id, r.language, r.form_data, r.raw_markdown_report, r.tokens_used, r.status, p.name, p.raasi, p.lagnam, p.nakshatra, u.email 
      FROM reports r
      JOIN profiles p ON r.profile_id = p.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ${report_id}
      LIMIT 1
    `;

    if (reports.length === 0) {
      return new Response(JSON.stringify({ error: 'Report not found in database' }), { status: 404 });
    }

    const report = reports[0];

    if (report.status === 'completed') {
      return new Response(JSON.stringify({ message: 'Already completed' }), { status: 200 });
    }

    const data = report.form_data; // This is the original JSON submitted by the user

    // 3. Mark as processing if not already
    if (report.status !== 'processing') {
      await sql`UPDATE reports SET status = 'processing' WHERE id = ${report_id}`;
    }

    // 4. Generate AI Report
    const apiKey = import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    const claudeModel = import.meta.env.ANTHROPIC_MODEL || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
    const anthropic = new Anthropic({ apiKey: apiKey });

    const userPrompt = `
Generate a life transformation report:
Name: ${report.name}
Raasi: ${report.raasi}
Lagnam: ${report.lagnam}
Nakshatra: ${report.nakshatra}${data.padam ? ` (Padam ${data.padam})` : ''}
Struggles: ${data.struggles?.join(', ') || 'None specified'}
Daily Life: ${data.dailyLife || 'Not specified'}
Biggest Goal: ${data.goals?.join(', ') || 'Not specified'}
Spiritual Orientation: ${data.spiritual || 'Not specified'}
Language: ${report.language || 'English'}
`;

    const systemPrompt = skillTemplate + `

CRITICAL INSTRUCTION: Output the final report as raw Markdown text. You MUST complete the entire report from Section 1 to Section 12 exactly as formatted in the skill guide. 
You must be highly concise, deeply impactful, and synthesize the information beautifully. Compress the text, summarize details, and avoid unnecessary repetition or overly long paragraphs. Keep it tight and highly focused. 
DO NOT STOP until Section 12 is fully generated.

CRITICAL ASSUMPTION INSTRUCTION: Under no circumstances should you ask the user any questions, request clarifications, or request additional inputs (such as birth Padam, exact time, or city details). If any details are missing, marked as "Don't know", or left blank, you MUST automatically make a reasonable astrological assumption or use a default (e.g. if Nakshatra Padam is unknown, default to Padam 1 or analyze generally), and proceed to generate the full, complete report immediately.

CRITICAL LANGUAGE INSTRUCTION: The user has requested the report in ${report.language || 'English'}. You MUST output the ENTIRE document (including all headings, tables, labels, advice, and paragraphs) flawlessly in ${report.language || 'English'}. If Tamil is requested, ensure the Tamil translation is deeply contextual, natural, and preserves the intense psychological tone without losing any meaning.

CRITICAL FORMATTING INSTRUCTION: Use standard Markdown tables for all tables required in the sections. Use Markdown H1 (#) for the main title, H2 (##) for sections, and blockquotes (>) for quotes.`;

    let textContent = report.raw_markdown_report || '';
    let isComplete = false;
    let messages: any[] = data.ai_messages || [{ role: "user", content: [{ type: "text", text: userPrompt }] }];
    let totalTokensUsed = report.tokens_used || 0;

    try {
      const msg: any = await anthropic.messages.create({
        model: claudeModel,
        max_tokens: 8192,
        temperature: 0.7,
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" }
          }
        ],
        messages: messages
      }, {
        headers: { "anthropic-beta": "prompt-caching-2024-07-31" }
      });

      for (const block of msg.content) {
        if (block.type === 'text') {
          textContent += block.text;
        }
      }

      if (msg.usage) {
        totalTokensUsed += (msg.usage.input_tokens || 0) + (msg.usage.output_tokens || 0);
      }

      if (msg.stop_reason === 'max_tokens') {
        // Append assistant's partial response and user's 'Continue' prompt to keep going
        messages.push({ role: "assistant", content: msg.content });
        messages.push({ role: "user", content: [{ type: "text", text: "Continue exactly where you left off. Do not repeat previous content, just continue formatting the remaining sections." }] });
      } else {
        isComplete = true;
      }
    } catch (aiError: any) {
      if (isModelDeprecatedError(aiError)) {
        await sendAdminAlert(
          'Claude Model Deprecated - Immediate Action Required',
          'The Claude AI model has been deprecated by Anthropic and is returning a 404 error.\n\n' +
          'Deprecated Model: ' + claudeModel + '\n' +
          'Error: ' + aiError.error.message + '\n\n' +
          'Fix: Update ANTHROPIC_MODEL in your Vercel Environment Variables\n' +
          'Latest Models: https://docs.anthropic.com/en/docs/about-claude/models'
        );
      } else if (isLowCreditError(aiError)) {
        await sendAdminAlert(
          'Anthropic API - Low Credit Balance',
          'Your Anthropic API account has run out of credits.\n\n' +
          'Error: ' + aiError.error.message + '\n\n' +
          'Fix: Please go to the Anthropic Billing Console to add funds immediately so user reports can continue generating.'
        );
      }
      throw aiError;
    }

    // 5. Update Database with Checkpoint
    data.ai_messages = messages; // Save ongoing conversation context

    if (!isComplete) {
      await sql`
        UPDATE reports 
        SET raw_markdown_report = ${textContent}, tokens_used = ${totalTokensUsed}, form_data = ${data}
        WHERE id = ${report_id}
      `;

      // Re-queue the exact same report_id to QStash to continue execution
      const requestUrl = new URL(request.url);
      const qstashUrl = `${process.env.QSTASH_URL}/v2/publish/${requestUrl.origin}/api/process-reading`;
      
      try {
        const qstashRes = await fetch(qstashUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.QSTASH_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ report_id }),
        });

        if (!qstashRes.ok) {
          throw new Error('Failed to re-queue chunk to QStash: ' + await qstashRes.text());
        }
      } catch (qstashError: any) {
        console.warn('QStash re-queue failed, executing continuation locally:', qstashError.message || qstashError);
        
        // Run continuation locally in background
        (async () => {
          try {
            const fakeReq = new Request(request.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ report_id })
            });
            await POST({ request: fakeReq } as any);
          } catch (recurseErr) {
            console.error('Recursive local processing continuation failed:', recurseErr);
          }
        })();
      }

      // Return 200 immediately so this Vercel function invocation completes quickly!
      return new Response(JSON.stringify({ status: 'continuing_chunk', chunkTokens: totalTokensUsed }), { status: 200 });
    }

    // --- IF WE REACH HERE, THE GENERATION IS FULLY COMPLETE ---
    
    // Clear out the massive ai_messages array to save database space since it's no longer needed
    delete data.ai_messages;

    await sql`
      UPDATE reports 
      SET status = 'completed', raw_markdown_report = ${textContent}, tokens_used = ${totalTokensUsed}, form_data = ${data}
      WHERE id = ${report_id}
    `;

    // 6. Generate Premium PDF via preview-pdf endpoint & Send Email
    if (report.email) {
      try {
        // Build the internal URL to the premium PDF generator and invoke it directly 
        // to bypass serverless loopback/HTTP firewall restrictions.
        const fakeReq = new Request(new URL('/api/preview-pdf?report_id=' + report_id, request.url));
        const { GET: getPreviewPdf } = await import('./preview-pdf');
        
        const pdfRes = await getPreviewPdf({ request: fakeReq, cookies: request.headers } as any);
        if (!pdfRes.ok) {
          throw new Error('PDF generation endpoint returned ' + pdfRes.status);
        }
        const pdfArrayBuffer = await pdfRes.arrayBuffer();
        const pdfBuffer = Buffer.from(pdfArrayBuffer);

        const filenameSafeName = report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        const resend = new Resend(import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY);
        const fromEmail = import.meta.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'Ask Astro Raja <reports@astroraja.com>';

        const { data: emailData, error: emailError } = await resend.emails.send({
          from: fromEmail,
          to: report.email,
          subject: 'Your Ask Astro Raja Life Transformation Report - ' + report.name,
          html: `
            <div style="background-color: #faf8f5; padding: 40px 20px; font-family: 'Outfit', Arial, sans-serif; color: #334155; line-height: 1.6;">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Outfit:wght@100..900&display=swap');
              </style>
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="background-color: #1e1b4b; padding: 30px; text-align: center; border-bottom: 4px solid #f59e0b;">
                  <h2 style="color: #ffffff; margin: 0; font-family: 'Lora', Georgia, serif; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Ask Astro Raja</h2>
                </div>
                <div style="padding: 40px 30px;">
                  <h3 style="margin-top: 0; color: #1e1b4b; font-family: 'Lora', Georgia, serif; font-size: 22px;">Hello <span style="color: #f59e0b;">${report.name}</span>,</h3>
                  <p style="font-size: 16px; margin-bottom: 20px;">Your deeply personalized <strong style="color: #1e1b4b;">Life Transformation Report</strong> is ready.</p>
                  <p style="font-size: 16px; margin-bottom: 30px;">We have securely attached your full report as a PDF document to this email. This report is based on your unique astrological blueprint and is designed to provide you with clarity, guidance, and actionable steps for your life.</p>
                  
                  <div style="background-color: #faf8f5; padding: 25px; border-left: 4px solid #f59e0b; margin: 30px 0; border-radius: 0 8px 8px 0;">
                    <h4 style="margin: 0 0 10px 0; color: #1e1b4b; font-family: 'Lora', Georgia, serif; font-size: 18px;">How to read this report:</h4>
                    <p style="margin: 0; font-size: 15px; color: #475569;">Take your time. Find a quiet space, read through the sections carefully, and reflect on the insights provided. This isn't just a reading; it's a structural intervention for your life.</p>
                  </div>
                  
                  <p style="font-size: 16px; margin-bottom: 10px;">If you have any questions or need further guidance, feel free to reply directly to this email.</p>
                  <p style="font-size: 16px; margin-top: 30px; margin-bottom: 0;">Warm regards,<br><strong style="color: #1e1b4b;">Astro Raja Team</strong></p>
                </div>
              </div>
              <div style="text-align: center; margin-top: 25px; font-size: 13px; color: #64748b; font-family: 'Outfit', Arial, sans-serif;">
                <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Astro Raja. All rights reserved.</p>
                <p style="margin: 5px 0;">You are receiving this email because you requested a Life Transformation Report.</p>
              </div>
            </div>
          `,
          attachments: [{
            filename: 'AstroRaja_Life_Report_' + filenameSafeName + '.pdf',
            content: pdfBuffer
          }]
        });

        if (emailError) {
          throw new Error(emailError.message);
        }
      } catch (emailError) {
        console.error('Failed to generate/send premium PDF email:', emailError);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: any) {
    console.error("Queue Processing Error:", error);
    // If it fails, we mark it failed so we know. QStash will still retry if it receives a 500.
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
