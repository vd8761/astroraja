import type { APIRoute } from 'astro';
import crypto from 'crypto';
import sql from '../../../lib/db';
import { marked } from 'marked';
import PdfPrinterPkg from 'pdfmake/js/Printer.js';
const PdfPrinter = PdfPrinterPkg.default || PdfPrinterPkg;
import URLResolverPkg from 'pdfmake/js/URLResolver.js';
const URLResolver = URLResolverPkg.default || URLResolverPkg;
import htmlToPdfmake from 'html-to-pdfmake';
import { parseHTML } from 'linkedom';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async ({ request, cookies }) => {
  // ── Auth Guard ─────────────────────────────────────────────────────────────
  const adminPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  const expectedHash = crypto.createHash('sha256').update(adminPassword).digest('hex');
  const authCookie = cookies.get('astro_admin_auth')?.value;
  if (authCookie !== expectedHash) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // ── Parse report ID ────────────────────────────────────────────────────────
  const url = new URL(request.url);
  const reportId = url.searchParams.get('id');
  if (!reportId) {
    return new Response(JSON.stringify({ error: 'Missing report id' }), { status: 400 });
  }

  // ── Fetch from DB ──────────────────────────────────────────────────────────
  const rows = await sql`
    SELECT
      r.id,
      r.language,
      r.raw_markdown_report,
      p.name,
      p.raasi,
      p.lagnam,
      p.nakshatra,
      u.email
    FROM reports r
    JOIN profiles p ON r.profile_id = p.id
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ${reportId}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: 'Report not found' }), { status: 404 });
  }

  const report = rows[0];

  if (!report.raw_markdown_report) {
    return new Response(JSON.stringify({ error: 'Report content not yet generated' }), { status: 422 });
  }

  // ── Markdown → HTML → PDF ──────────────────────────────────────────────────
  try {
    const parsedMarkdown = await marked.parse(report.raw_markdown_report);
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    const fonts = {
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

    // ── Safe filename ────────────────────────────────────────────────────────
    const safeName = (report.name || 'report').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `AstroRaja_Report_${safeName}.pdf`;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'no-store',
      },
    });

  } catch (err: any) {
    console.error('PDF generation error:', err);
    return new Response(
      JSON.stringify({ error: 'PDF generation failed', detail: err.message }),
      { status: 500 }
    );
  }
};
