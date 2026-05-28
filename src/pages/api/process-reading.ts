import type { APIRoute } from 'astro';
import sql from '../../lib/db';
import Anthropic from '@anthropic-ai/sdk';
import nodemailer from 'nodemailer';

export const config = {
  maxDuration: 300,
};

import { sendAdminAlert, isModelDeprecatedError } from '../../lib/adminAlert';
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

CRITICAL INSTRUCTION: Output the final report as raw Markdown text. You MUST complete the entire report from Section 1 to Section 18 exactly as formatted in the skill guide. 
You must be highly concise, deeply impactful, and synthesize the information beautifully. Compress the text, summarize details, and avoid unnecessary repetition or overly long paragraphs. Keep it tight and highly focused. 
DO NOT STOP until Section 18 is fully generated.

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
          'Claude Model Deprecated — Immediate Action Required',
          'The Claude AI model has been deprecated by Anthropic and is returning a 404 error.\n\n' +
          'Deprecated Model: ' + claudeModel + '\n' +
          'Error: ' + aiError.error.message + '\n\n' +
          'Fix: Update ANTHROPIC_MODEL in your Vercel Environment Variables\n' +
          'Latest Models: https://docs.anthropic.com/en/docs/about-claude/models'
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

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'askastroraja@gmail.com',
            pass: import.meta.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD
          }
        });

        await transporter.sendMail({
          from: '"Astro Raja" <askastroraja@gmail.com>',
          to: report.email,
          subject: 'Your Astro Raja Life Transformation Report - ' + report.name,
          text: 'Hello ' + report.name + ',\n\nYour Astro Raja Life Transformation Report is ready! Please find the PDF document attached to this email.\n\nBest regards,\nAstro Raja Team',
          attachments: [{
            filename: 'AstroRaja_Life_Report_' + filenameSafeName + '.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf'
          }]
        });
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
