import type { APIRoute } from 'astro';
import crypto from 'crypto';
import sql from '../../../lib/db';
import { Resend } from 'resend';

export const config = {
  maxDuration: 300,
};

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

    const resend = new Resend(import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY);
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'Astro Raja <reports@astroraja.com>';

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: report.email,
      subject: 'Your Astro Raja Life Transformation Report - ' + report.name,
      html: `
        <div style="background-color: #faf8f5; padding: 40px 20px; font-family: 'Outfit', Arial, sans-serif; color: #334155; line-height: 1.6;">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Outfit:wght@100..900&display=swap');
          </style>
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="background-color: #1e1b4b; padding: 30px; text-align: center; border-bottom: 4px solid #f59e0b;">
              <h2 style="color: #ffffff; margin: 0; font-family: 'Lora', Georgia, serif; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Ask Astro Raja</h2>
            </div>
            <div style="padding: 40px 30px;">
              <h3 style="margin-top: 0; color: #1e1b4b; font-family: 'Lora', Georgia, serif; font-size: 22px;">Hello <span style="color: #f59e0b;">${report.name}</span>,</h3>
              <p style="font-size: 16px; margin-bottom: 20px;">Your deeply personalized <strong style="color: #1e1b4b;">Life Transformation Report</strong> is ready.</p>
              <p style="font-size: 16px; margin-bottom: 30px;">We have securely attached your full report as a PDF document to this email. This report is based on your unique astrological blueprint and is designed to provide you with clarity, guidance, and actionable steps for your life.</p>
              
              <div style="background-color: #faf8f5; padding: 25px; border-left: 4px solid #f59e0b; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1e1b4b; font-family: 'Lora', Georgia, serif; font-size: 18px;">How to read this report:</h4>
                <p style="margin: 0; font-size: 15px; color: #475569;">Take your time. Find a quiet space, read through the sections carefully, and reflect on the insights provided. This isn't just a reading; it's a structural intervention for your life.</p>
              </div>
              
              <p style="font-size: 16px; margin-bottom: 10px;">If you have any questions or need further guidance, feel free to reply directly to this email.</p>
              <p style="font-size: 16px; margin-top: 30px; margin-bottom: 0;">Warm regards,<br><strong style="color: #1e1b4b;">Astro Raja Team</strong></p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 25px; font-size: 13px; color: #64748b; font-family: 'Outfit', Arial, sans-serif;">
            <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Astro Raja. All rights reserved.</p>
            <p style="margin: 5px 0;">You are receiving this email because you requested a Life Transformation Report.</p>
          </div>
        </div>
      `,
      attachments: [{
        filename: 'AstroRaja_Life_Report_' + filenameSafeName + '.pdf',
        content: pdfBuffer
      }]
    });

    if (emailError) {
      throw new Error(emailError.message);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error("Manual Email Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
