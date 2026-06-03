import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { qstash } from '../../../lib/qstash';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Basic auth check if called manually from client side (optional but recommended)
    // Here we'll just allow it since the dashboard is already protected,
    // but in a real scenario you'd verify the admin auth cookie if it wasn't a cron call.

    // Optional: Accept array of specific report IDs from frontend
    let stuckReports = [];
    
    if (request.method === 'POST' && request.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await request.json();
        if (body && Array.isArray(body.report_ids) && body.report_ids.length > 0) {
          const ids = body.report_ids;
          // Security: validate IDs are strings
          if (ids.every(id => typeof id === 'string')) {
            stuckReports = await sql`SELECT id FROM reports WHERE id = ANY(${ids})`;
          }
        }
      } catch (e) {
        // ignore parse errors, fallback to default behavior
      }
    }

    if (stuckReports.length === 0) {
      // Default: Find reports stuck in 'processing' or 'queued' for more than 30 minutes
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      stuckReports = await sql`
        SELECT id FROM reports 
        WHERE (status = 'processing' OR status = 'queued' OR status = 'failed')
        AND created_at < ${thirtyMinsAgo}
      `;
    }

    if (stuckReports.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No stuck reports found.' }), { status: 200 });
    }

    // 2. Re-queue them
    const baseUrl = new URL(request.url).origin;
    const processUrl = `${baseUrl}/api/process-reading`;
    let requeuedCount = 0;

    for (const report of stuckReports) {
      // Set status back to queued
      await sql`UPDATE reports SET status = 'queued' WHERE id = ${report.id}`;
      
      // Publish to QStash
      await qstash.publishJSON({
        url: processUrl,
        body: { report_id: report.id },
        retries: 3
      });
      
      requeuedCount++;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully requeued ${requeuedCount} stuck report(s).` 
    }), { status: 200 });

  } catch (error: any) {
    console.error('Retry Stuck Reports Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
