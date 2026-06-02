import type { APIRoute } from 'astro';
import { BaseReport } from '../../lib/report/baseReport';

export const config = {
  maxDuration: 300,
};

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const reportId = url.searchParams.get('report_id');
    if (!reportId) return json({ error: 'report_id is required' }, 400);

    // ── Fetch the completed report + profile ──────────────────────────────
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || (import.meta as any).env?.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL not set');
    const sql = neon(dbUrl);

    const rows = (await sql`
      SELECT r.id, r.raw_markdown_report, p.name, p.raasi, p.lagnam, p.nakshatra, p.padam
      FROM reports r
      JOIN profiles p ON r.profile_id = p.id
      WHERE r.id = ${reportId} AND r.status = 'completed'
      LIMIT 1
    `) as any[];

    if (rows.length === 0) return json({ error: 'Report not found or not completed' }, 404);
    const row = rows[0];

    if (!row.raw_markdown_report) return json({ error: 'Report has no generated content' }, 422);

    // ── Build the PDF ─────────────────────────────────────────────────────
    const report = new BaseReport({
      reportId: String(row.id),
      name: row.name || 'Report',
      raasi: row.raasi || '',
      lagnam: row.lagnam || '',
      nakshatra: row.nakshatra || '',
      padam: row.padam ?? '',
      markdown: row.raw_markdown_report,
    });
    const pdfBuffer = await report.toBuffer();

    const safeName = String(row.name || 'Report').replace(/[^a-z0-9]/gi, '_');
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="AstroRaja_${safeName}_Report.pdf"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('PDF preview error:', err);
    return json({ error: 'PDF preview failed', detail: err?.message }, 500);
  }
};
