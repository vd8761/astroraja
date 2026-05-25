import type { APIRoute } from 'astro';
import sql from '../../lib/db';
import Anthropic from '@anthropic-ai/sdk';
import nodemailer from 'nodemailer';
import { marked } from 'marked';
import skillTemplate from '../../lib/skill.md?raw';

// @ts-ignore
import PdfPrinterPkg from 'pdfmake/src/printer.js';
const PdfPrinter = PdfPrinterPkg.default || PdfPrinterPkg;
import htmlToPdfmake from 'html-to-pdfmake';
import { parseHTML } from 'linkedom';
import fs from 'fs';
import path from 'path';

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

    const systemPrompt = skillTemplate + `

CRITICAL INSTRUCTION: Output the final report as raw Markdown text. You MUST complete the entire report from Section 1 to Section 14 exactly as formatted in the skill guide. 
Do not skip any section, table, or paragraph. Provide maximum detail and context for every point.
To avoid getting cut off by token limits, we have allocated 8192 tokens. DO NOT STOP until Section 14 is fully generated.

CRITICAL LANGUAGE INSTRUCTION: The user has requested the report in ${report.language || 'English'}. You MUST output the ENTIRE document (including all headings, tables, labels, advice, and paragraphs) flawlessly in ${report.language || 'English'}. If Tamil is requested, ensure the Tamil translation is deeply contextual, natural, and preserves the intense psychological tone without losing any meaning.

CRITICAL FORMATTING INSTRUCTION: Use standard Markdown tables for all tables required in the sections. Use Markdown H1 (#) for the main title, H2 (##) for sections, and blockquotes (>) for quotes.`;

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
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

    // 6. Generate PDF and Send Email
    if (report.email) {
      try {
        const parsedMarkdown = await marked.parse(textContent);
        const filenameSafeName = report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        // Define fonts for pdfmake
        const fontsDir = path.join(process.cwd(), 'public', 'fonts');
        const fonts = {
          Roboto: {
            normal: path.join(fontsDir, 'NotoSans-Regular.ttf'),
            bold: path.join(fontsDir, 'NotoSans-Bold.ttf'),
            italics: path.join(fontsDir, 'NotoSans-Regular.ttf'),
            bolditalics: path.join(fontsDir, 'NotoSans-Bold.ttf')
          },
          Tamil: {
            normal: path.join(fontsDir, 'NotoSansTamil-Regular.ttf'),
            bold: path.join(fontsDir, 'NotoSansTamil-Bold.ttf'),
            italics: path.join(fontsDir, 'NotoSansTamil-Regular.ttf'),
            bolditalics: path.join(fontsDir, 'NotoSansTamil-Bold.ttf')
          }
        };

        const printer = new PdfPrinter(fonts);
        
        // We must pass a JSDOM window to html-to-pdfmake to parse the HTML string
        const { window } = parseHTML("<html><body></body></html>");
        const pdfContent = htmlToPdfmake(parsedMarkdown, { window });

        const fontFamily = report.language === 'Tamil' ? 'Tamil' : 'Roboto';

        const docDefinition: any = {
          pageSize: 'A4',
          pageMargins: [50, 60, 50, 60],
          header: (currentPage: number, pageCount: number) => ({
            columns: [
              {
                text: '✦ Ask Astro Raja — Life Transformation Report',
                fontSize: 9,
                color: '#2E6B9E',
                bold: true,
                margin: [50, 18, 0, 0],
              },
              {
                text: `${report.name}  |  Page ${currentPage} of ${pageCount}`,
                fontSize: 9,
                color: '#94A3B8',
                alignment: 'right',
                margin: [0, 18, 50, 0],
              }
            ]
          }),
          footer: (_currentPage: number, _pageCount: number) => ({
            text: `${report.raasi || ''} · ${report.lagnam || ''} · ${report.nakshatra || ''}  —  Confidential & Personalized`,
            fontSize: 8,
            color: '#CBD5E1',
            alignment: 'center',
            margin: [50, 0, 50, 18],
          }),
          content: [
            {
              stack: [
                { text: 'LIFE TRANSFORMATION REPORT', fontSize: 10, color: '#C5952A', bold: true, letterSpacing: 2, margin: [0, 0, 0, 8] },
                { text: report.name, fontSize: 28, bold: true, color: '#1A3C5E', font: fontFamily, margin: [0, 0, 0, 6] },
                {
                  columns: [
                    { text: `Raasi: ${report.raasi || '—'}`, fontSize: 12, color: '#475569' },
                    { text: `Lagnam: ${report.lagnam || '—'}`, fontSize: 12, color: '#475569' },
                    { text: `Nakshatra: ${report.nakshatra || '—'}`, fontSize: 12, color: '#475569' },
                  ],
                  margin: [0, 0, 0, 4],
                },
                { text: `Language: ${report.language || 'English'}`, fontSize: 11, color: '#94A3B8', margin: [0, 0, 0, 20] },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 495, y2: 0, lineWidth: 1.5, lineColor: '#C5952A' }] },
              ],
              margin: [0, 20, 0, 24],
            },
            pdfContent,
          ],
          defaultStyle: {
            font: fontFamily,
            fontSize: 11,
            lineHeight: 1.55,
            color: '#1e293b',
          },
          styles: {
            'html-h1': {
              fontSize: 18,
              bold: true,
              color: '#1A3C5E',
              margin: [0, 20, 0, 8],
              decoration: 'underline',
              decorationColor: '#C5952A',
              font: fontFamily,
            },
            'html-h2': {
              fontSize: 14,
              bold: true,
              color: '#2E6B9E',
              margin: [0, 16, 0, 6],
              font: fontFamily,
            },
            'html-h3': {
              fontSize: 12,
              bold: true,
              color: '#475569',
              margin: [0, 12, 0, 4],
            },
            'html-p': {
              margin: [0, 4, 0, 8],
              lineHeight: 1.6,
            },
            'html-blockquote': {
              margin: [12, 6, 0, 12],
              italics: true,
              color: '#1A3C5E',
              fontSize: 12,
              bold: true,
            },
            'html-strong': {
              bold: true,
              color: '#1A3C5E',
            },
            'html-table': {
              margin: [0, 6, 0, 14],
            },
            'html-th': {
              bold: true,
              fillColor: '#1A3C5E',
              color: '#FFFFFF',
              fontSize: 10,
            },
            'html-td': {
              fontSize: 10,
              margin: [4, 4, 4, 4],
            },
            'html-li': {
              margin: [0, 3, 0, 3],
            },
          },
        };

        const pdfDoc = await printer.createPdfKitDocument(docDefinition as any);
        const chunks: Buffer[] = [];
        
        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
          pdfDoc.on('data', chunk => chunks.push(chunk));
          pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
          pdfDoc.on('error', reject);
          pdfDoc.end();
        });

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
          text: `Hello ${report.name},\n\nYour Astro Raja Life Transformation Report is ready! Please find the PDF document attached to this email.\n\nBest regards,\nAstro Raja Team`,
          attachments: [{
            filename: `AstroRaja_Life_Report_${filenameSafeName}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
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
