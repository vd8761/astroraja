import type { APIRoute } from 'astro';
import crypto from 'crypto';
import sql from '../../../lib/db';
import { marked } from 'marked';
import PdfPrinter from 'pdfmake';
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

    // Font configuration — Tamil reports use NotoSansTamil
    const fonts: Record<string, any> = {
      Roboto: {
        normal:      path.join(fontsDir, 'NotoSans-Regular.ttf'),
        bold:        path.join(fontsDir, 'NotoSans-Bold.ttf'),
        italics:     path.join(fontsDir, 'NotoSans-Regular.ttf'),
        bolditalics: path.join(fontsDir, 'NotoSans-Bold.ttf'),
      },
      Tamil: {
        normal:      path.join(fontsDir, 'NotoSansTamil-Regular.ttf'),
        bold:        path.join(fontsDir, 'NotoSansTamil-Bold.ttf'),
        italics:     path.join(fontsDir, 'NotoSansTamil-Regular.ttf'),
        bolditalics: path.join(fontsDir, 'NotoSansTamil-Bold.ttf'),
      },
    };

    const isValidFont = (p: string) => { try { return fs.existsSync(p); } catch { return false; } };
    const fontFamily = (report.language === 'Tamil' && isValidFont(fonts.Tamil.normal))
      ? 'Tamil'
      : 'Roboto';

    const printer = new PdfPrinter(fonts);

    // Parse HTML for pdfmake
    const { window } = parseHTML('<html><body></body></html>');
    const pdfContent = htmlToPdfmake(parsedMarkdown, { window });

    // ── Document Definition ──────────────────────────────────────────────────
    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [50, 60, 50, 60],

      // ── Header (every page) ───────────────────────────────────────────────
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

      // ── Footer (every page) ───────────────────────────────────────────────
      footer: (_currentPage: number, _pageCount: number) => ({
        text: `${report.raasi || ''} · ${report.lagnam || ''} · ${report.nakshatra || ''}  —  Confidential & Personalized`,
        fontSize: 8,
        color: '#CBD5E1',
        alignment: 'center',
        margin: [50, 0, 50, 18],
      }),

      content: [
        // ── Cover Block ────────────────────────────────────────────────────
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

        // ── Main Report Content ────────────────────────────────────────────
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

    const pdfDoc = printer.createPdfKitDocument(docDefinition as any);
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
