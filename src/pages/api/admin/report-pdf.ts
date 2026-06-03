import type { APIRoute } from 'astro';
import crypto from 'crypto';

export const GET: APIRoute = async ({ request, cookies }) => {
  // ── Auth Guard ─────────────────────────────────────────────────────────────
  const adminPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  const expectedHash = crypto.scryptSync(adminPassword, 'admin_salt', 64).toString('hex');
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

  // ── Proxy to Premium PDF Generator ──────────────────────────────────────────
  try {
    const fakeReq = new Request(new URL('/api/preview-pdf?report_id=' + reportId, request.url));
    const { GET: getPreviewPdf } = await import('../preview-pdf.ts');
    
    const pdfRes = await getPreviewPdf({ request: fakeReq, cookies: request.headers } as any);
    if (!pdfRes.ok) {
      throw new Error('PDF generation endpoint returned ' + pdfRes.status);
    }
    
    const pdfArrayBuffer = await pdfRes.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    // ── Safe filename ────────────────────────────────────────────────────────
    const filename = `AstroRaja_Premium_Report.pdf`;

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
