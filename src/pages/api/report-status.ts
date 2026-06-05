import type { APIRoute } from 'astro';
import sql from '../../lib/db';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const reportId = url.searchParams.get('report_id');
    
    if (!reportId) {
      return new Response(JSON.stringify({ error: 'Missing report_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Query status and raw_markdown_report from database
    const reports = await sql`
      SELECT status, raw_markdown_report 
      FROM reports 
      WHERE id = ${reportId} 
      LIMIT 1
    `;

    if (reports.length === 0) {
      return new Response(JSON.stringify({ error: 'Report not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const report = reports[0];
    const length = report.raw_markdown_report ? report.raw_markdown_report.length : 0;

    return new Response(JSON.stringify({
      status: report.status,
      length: length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
