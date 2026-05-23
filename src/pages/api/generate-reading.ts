import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import nodemailer from 'nodemailer';
import { marked } from 'marked';
import skillTemplate from '../../lib/skill.md?raw';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    if (!data.name || !data.raasi || !data.lagnam) {
      return new Response(JSON.stringify({ error: 'Missing required fields: name, raasi, lagnam' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Anthropic API key is not configured on the server.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const userPrompt = `
Generate a life transformation report:
Name: ${data.name}
Raasi: ${data.raasi}
Lagnam: ${data.lagnam}
Nakshatra: ${data.nakshatra}
Struggles: ${data.struggles?.join(', ') || 'None specified'}
Daily Life: ${data.dailyLife || 'Not specified'}
Biggest Goal: ${data.goals?.join(', ') || 'Not specified'}
Spiritual Orientation: ${data.spiritual || 'Not specified'}
Language: ${data.language || 'English'}
`;

    // The SKILL.md actually asks for output in .docx format by default, but we'll 
    // ask Claude to output plain text markdown so we can easily save it as a .txt file.
    const systemPrompt = skillTemplate + `\n\nCRITICAL INSTRUCTION: Output the final report as raw Markdown text. You MUST complete the entire report from Section 1 to Section 14. To avoid getting cut off by token limits, be EXTREMELY CONCISE in each section. Do not ramble. Get straight to the point. DO NOT STOP until Section 14 is fully generated.\n\nCRITICAL LANGUAGE INSTRUCTION: The user has requested the report in ${data.language || 'English'}. You MUST output the ENTIRE document (including all headings, tables, labels, advice, and paragraphs) in ${data.language || 'English'}. Do not output English headers if the language requested is Tamil.`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": userPrompt
            }
          ]
        }
      ]
    });

    // Extract the text content from the response
    let textContent = '';
    for (const block of msg.content) {
      if (block.type === 'text') {
        textContent += block.text;
      }
    }

    // --- Token Usage Logging ---
    try {
      const inputTokens = msg.usage.input_tokens;
      const outputTokens = msg.usage.output_tokens;
      const totalTokens = inputTokens + outputTokens;
      
      const logEntry = `[TOKEN USAGE] User: ${data.name || 'Unknown'} | Raasi: ${data.raasi || 'N/A'} | Input Tokens: ${inputTokens} | Output Tokens: ${outputTokens} | Total Tokens: ${totalTokens}`;
      
      // On Vercel, we must log to the console because the filesystem is read-only.
      // You can view these logs securely in the Vercel Dashboard -> Logs tab.
      console.log(logEntry);
    } catch (logErr) {
      console.error("Failed to calculate tokens:", logErr);
    }
    // --------------------------------------------------

    // --- Email Sending Logic ---
    if (data.email) {
      try {
        const parsedMarkdown = await marked.parse(textContent);
        const filenameSafeName = data.name ? data.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'user';
        
        const htmlReport = `<!DOCTYPE html>
<html lang="${data.language === 'Tamil' ? 'ta' : 'en'}">
<head>
    <meta charset="UTF-8">
    <title>Astro Raja Report - ${data.name}</title>
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

        const mailOptions = {
          from: '"Astro Raja" <askastroraja@gmail.com>',
          to: data.email,
          subject: `Your Astro Raja Life Transformation Report - ${data.name}`,
          text: `Hello ${data.name},\n\nYour Astro Raja Life Transformation Report is ready! Please find the beautifully formatted document attached to this email.\n\nBest regards,\nAstro Raja Team`,
          attachments: [
            {
              filename: `AstroRaja_Life_Report_${filenameSafeName}.html`,
              content: htmlReport,
              contentType: 'text/html'
            }
          ]
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to ${data.email}`);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Continue without throwing so the UI still displays the report to the user
      }
    }
    // --------------------------------------------------

    return new Response(JSON.stringify({ success: true, report: textContent }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error("Error generating report:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
