import type { APIRoute } from 'astro';
import sql from '../../lib/db';
import Anthropic from '@anthropic-ai/sdk';
import nodemailer from 'nodemailer';
import { marked } from 'marked';
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
      SELECT r.id, r.language, r.form_data, p.name, p.raasi, p.lagnam, p.nakshatra, u.email 
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
    const data = report.form_data; // This is the original JSON submitted by the user

    // 3. Mark as processing
    await sql`UPDATE reports SET status = 'processing' WHERE id = ${report_id}`;

    // 4. Generate AI Report
    const apiKey = import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    const anthropic = new Anthropic({ apiKey: apiKey });

    const userPrompt = `
Generate a life transformation report:
Name: ${report.name}
Raasi: ${report.raasi}
Lagnam: ${report.lagnam}
Nakshatra: ${report.nakshatra}
Struggles: ${data.struggles?.join(', ') || 'None specified'}
Daily Life: ${data.dailyLife || 'Not specified'}
Biggest Goal: ${data.goals?.join(', ') || 'Not specified'}
Spiritual Orientation: ${data.spiritual || 'Not specified'}
Language: ${report.language || 'English'}
`;

    const systemPrompt = skillTemplate + `\n\nCRITICAL INSTRUCTION: Output the final report as raw Markdown text. You MUST complete the entire report from Section 1 to Section 14. To avoid getting cut off by token limits, be EXTREMELY CONCISE in each section. Do not ramble. Get straight to the point. DO NOT STOP until Section 14 is fully generated.\n\nCRITICAL LANGUAGE INSTRUCTION: The user has requested the report in ${report.language || 'English'}. You MUST output the ENTIRE document (including all headings, tables, labels, advice, and paragraphs) in ${report.language || 'English'}. Do not output English headers if the language requested is Tamil.`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: "user", content: [{ type: "text", text: userPrompt }] }]
    });

    let textContent = '';
    for (const block of msg.content) {
      if (block.type === 'text') {
        textContent += block.text;
      }
    }

    // 5. Update Database with Completed Report
    await sql`
      UPDATE reports 
      SET status = 'completed', raw_markdown_report = ${textContent}
      WHERE id = ${report_id}
    `;

    // 6. Send Email
    if (report.email) {
      try {
        const parsedMarkdown = await marked.parse(textContent);
        const filenameSafeName = report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        const htmlReport = `<!DOCTYPE html>
<html lang="${report.language === 'Tamil' ? 'ta' : 'en'}">
<head>
    <meta charset="UTF-8">
    <title>Astro Raja Report - ${report.name}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #1e3a8a; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }
        h2 { color: #1e3a8a; margin-top: 30px; }
        h3 { color: #475569; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
        th { background-color: #f1f5f9; }
        blockquote { border-left: 4px solid #f59e0b; padding-left: 15px; font-style: italic; color: #64748b; background: #f8fafc; padding: 10px 15px; margin-left: 0; }
        @media print {
            body { margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    ${parsedMarkdown}
</body>
</html>`;

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
          subject: `Your Astro Raja Life Transformation Report - ${report.name}`,
          text: `Hello ${report.name},\n\nYour Astro Raja Life Transformation Report is ready! Please find the document attached to this email.\n\nBest regards,\nAstro Raja Team`,
          attachments: [{
            filename: `AstroRaja_Life_Report_${filenameSafeName}.html`,
            content: htmlReport,
            contentType: 'text/html'
          }]
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: any) {
    console.error("Queue Processing Error:", error);
    // If it fails, we mark it failed so we know. QStash will still retry if it receives a 500.
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
