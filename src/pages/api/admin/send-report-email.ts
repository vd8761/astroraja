import type { APIRoute } from 'astro';
import crypto from 'crypto';
import sql from '../../../lib/db';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request, cookies }) => {
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

  try {
    const data = await request.json();
    const reportId = data.report_id;

    if (!reportId) {
      return new Response(JSON.stringify({ error: 'Missing report_id' }), { status: 400 });
    }

    // ── Fetch from DB ──────────────────────────────────────────────────────────
    const rows = await sql`
      SELECT r.id, p.name, u.email
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

    if (!report.email) {
      return new Response(JSON.stringify({ error: 'User does not have an email address' }), { status: 400 });
    }

    // ── Generate PDF Buffer directly from preview-pdf ────────────────────────
    const fakeReq = new Request(new URL('/api/preview-pdf?report_id=' + report.id, request.url));
    const { GET: getPreviewPdf } = await import('../preview-pdf');
    
    const pdfRes = await getPreviewPdf({ request: fakeReq, cookies: cookies } as any);
    if (!pdfRes.ok) {
      throw new Error('PDF generation endpoint returned ' + pdfRes.status);
    }
    const pdfArrayBuffer = await pdfRes.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    // ── Send Email ───────────────────────────────────────────────────────────
    const filenameSafeName = report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

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
      subject: 'Your Astro Raja Life Transformation Report - ' + report.name,
      text: 'Hello ' + report.name + ',\n\nYour Astro Raja Life Transformation Report is ready! Please find the PDF document attached to this email.\n\nBest regards,\nAstro Raja Team',
      attachments: [{
        filename: 'AstroRaja_Life_Report_' + filenameSafeName + '.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error("Manual Email Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
