import type { APIRoute } from 'astro';
import sql from '../../lib/db';
import Anthropic from '@anthropic-ai/sdk';
import nodemailer from 'nodemailer';
import { sendAdminAlert, isModelDeprecatedError } from '../../lib/adminAlert';
import { marked } from 'marked';
import skillTemplate from '../../lib/skill.md?raw';

import PdfPrinterPkg from 'pdfmake/js/Printer.js';
const PdfPrinter = PdfPrinterPkg.default || PdfPrinterPkg;
import URLResolverPkg from 'pdfmake/js/URLResolver.js';
const URLResolver = URLResolverPkg.default || URLResolverPkg;
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
    const claudeModel = import.meta.env.ANTHROPIC_MODEL || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
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

    let msg;
    try {
      msg = await anthropic.messages.create({
        model: claudeModel,
        max_tokens: 8192,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{ role: "user", content: [{ type: "text", text: userPrompt }] }]
      });
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
          NotoSans: {
            normal:      path.join(fontsDir, 'NotoSans-Regular.ttf'),
            bold:        path.join(fontsDir, 'NotoSans-Bold.ttf'),
            italics:     path.join(fontsDir, 'NotoSans-Regular.ttf'),
            bolditalics: path.join(fontsDir, 'NotoSans-Bold.ttf'),
          },
          NotoSerif: {
            normal:      path.join(fontsDir, 'NotoSerif-Regular.ttf'),
            bold:        path.join(fontsDir, 'NotoSerif-Bold.ttf'),
            italics:     path.join(fontsDir, 'NotoSerif-Regular.ttf'),
            bolditalics: path.join(fontsDir, 'NotoSerif-Bold.ttf'),
          },
        };

        const { window } = parseHTML("<html><body></body></html>");
        const pdfContent = htmlToPdfmake(parsedMarkdown, { 
          window,
          tableAutoSize: true 
        });

        const colors = {
          primary: '#0F2027',
          secondary: '#203A43',
          accent: '#D4AF37',
          textMain: '#334155',
          textLight: '#64748B',
          bgLight: '#F8FAFC',
          white: '#FFFFFF',
        };

        const docDefinition: any = {
          pageSize: 'A4',
          pageMargins: [50, 80, 50, 70],
          header: (currentPage: number, pageCount: number) => ({
            margin: [50, 30, 50, 0],
            columns: [
              {
                text: '✦ ASK ASTRO RAJA',
                font: 'NotoSerif',
                fontSize: 9,
                color: colors.accent,
                bold: true,
                letterSpacing: 2,
              },
              {
                text: `${report.name.toUpperCase()}  |  PAGE ${currentPage} OF ${pageCount}`,
                font: 'NotoSerif',
                fontSize: 8,
                color: colors.textLight,
                alignment: 'right',
                letterSpacing: 1,
              }
            ],
            canvas: [{ type: 'line', x1: 50, y1: 20, x2: 545, y2: 20, lineWidth: 0.5, lineColor: colors.accent }]
          }),
          footer: (currentPage: number, _pageCount: number) => ({
            margin: [50, 20, 50, 0],
            stack: [
              { canvas: [{ type: 'line', x1: 50, y1: 0, x2: 545, y2: 0, lineWidth: 0.5, lineColor: '#E2E8F0' }], margin: [0, 0, 0, 10] },
              {
                text: `${report.raasi} (Raasi) · ${report.lagnam} (Lagnam) · ${report.nakshatra} (Nakshatra)`,
                font: 'NotoSerif',
                fontSize: 8,
                color: colors.textLight,
                alignment: 'center',
                letterSpacing: 0.5,
              }
            ]
          }),
          content: [
            {
              stack: [
                { text: 'THE LIFE TRANSFORMATION', font: 'NotoSerif', fontSize: 10, color: colors.accent, bold: true, letterSpacing: 3, margin: [0, 0, 0, 8] },
                { text: 'Karmic Blueprint & Action Plan', font: 'NotoSerif', fontSize: 26, bold: true, color: colors.primary, margin: [0, 0, 0, 15] },
                {
                  columns: [
                    { text: `RAASI: ${report.raasi}`, font: 'NotoSans', fontSize: 10, color: colors.secondary, bold: true },
                    { text: `LAGNAM: ${report.lagnam}`, font: 'NotoSans', fontSize: 10, color: colors.secondary, bold: true },
                    { text: `NAKSHATRA: ${report.nakshatra}`, font: 'NotoSans', fontSize: 10, color: colors.secondary, bold: true },
                  ],
                  margin: [0, 0, 0, 25],
                },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 495, y2: 0, lineWidth: 2, lineColor: colors.accent }] },
              ],
              margin: [0, 10, 0, 35],
            },
            ...pdfContent,
          ],
          defaultStyle: {
            font: 'NotoSans',
            fontSize: 10.5,
            lineHeight: 1.6,
            color: colors.textMain,
          },
          styles: {
            'html-h1': {
              font: 'NotoSerif',
              fontSize: 18,
              bold: true,
              color: colors.primary,
              margin: [0, 30, 0, 12],
              textTransform: 'uppercase',
              letterSpacing: 1,
            },
            'html-h2': {
              font: 'NotoSerif',
              fontSize: 15,
              bold: true,
              color: colors.secondary,
              margin: [0, 25, 0, 10],
              textTransform: 'uppercase',
              letterSpacing: 1,
            },
            'html-h3': {
              font: 'NotoSerif',
              fontSize: 13,
              bold: true,
              color: colors.accent,
              margin: [0, 15, 0, 8],
            },
            'html-p': { margin: [0, 5, 0, 12], alignment: 'justify' },
            'html-blockquote': { margin: [20, 15, 20, 15], font: 'NotoSerif', italics: true, color: colors.primary, fontSize: 13, lineHeight: 1.5, alignment: 'center' },
            'html-strong': { bold: true, color: colors.primary },
            'html-em': { italics: true, color: colors.secondary },
            'html-table': { margin: [0, 10, 0, 20] },
            'html-th': { font: 'NotoSans', bold: true, fillColor: colors.primary, color: colors.white, fontSize: 10, margin: [8, 8, 8, 8], alignment: 'left', textTransform: 'uppercase' },
            'html-td': { font: 'NotoSans', fontSize: 10, margin: [8, 8, 8, 8], color: colors.textMain },
            'html-li': { margin: [0, 4, 0, 4] },
          },
        };

        const urlResolver = new URLResolver();
        const printer = new PdfPrinter(fonts, null, urlResolver);
        const pdfDoc = await printer.createPdfKitDocument(docDefinition as any);
        
        const chunks: Buffer[] = [];
        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
          pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
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
