import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import crypto from 'crypto';
import sql from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  // 1. Verify QStash Signature (basic validation)
  const signature = request.headers.get('upstash-signature');
  if (!signature && process.env.NODE_ENV !== 'development') {
    return new Response(JSON.stringify({ error: 'Missing Upstash signature' }), { status: 401 });
  }

  try {
    const data = await request.json();
    const reportId = data.report_id;

    if (!reportId) {
      return new Response(JSON.stringify({ error: 'Missing report_id' }), { status: 400 });
    }

    // 2. Fetch the report to ensure it's completed and get user info
    const rows = await sql`
      SELECT r.id, r.status, p.name, u.email
      FROM reports r
      JOIN profiles p ON r.profile_id = p.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ${reportId}
    `;

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Report not found' }), { status: 404 });
    }

    const report = rows[0];

    // Only send feedback request if the report was actually successfully completed
    if (report.status !== 'completed') {
      return new Response(JSON.stringify({ error: 'Report is not in completed status', currentStatus: report.status }), { status: 400 });
    }

    if (!report.email) {
      return new Response(JSON.stringify({ error: 'User does not have an email' }), { status: 400 });
    }

    // 3. Send the beautiful feedback email
    const resend = new Resend(import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY);
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'Ask Astro Raja <reports@astroraja.com>';
    
    // Construct the absolute URL to the feedback page
    const baseUrl = new URL(request.url).origin;
    const feedbackUrl = `${baseUrl}/feedback/${report.id}`;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: report.email,
      subject: `How was your reading, ${report.name}? 🌟`,
      html: `
        <div style="background-color: #faf8f5; padding: 40px 20px; font-family: 'Outfit', Arial, sans-serif; color: #334155; line-height: 1.6;">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Outfit:wght@100..900&display=swap');
          </style>
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="background-color: #1e1b4b; padding: 30px; text-align: center; border-bottom: 4px solid #f59e0b;">
              <h2 style="color: #ffffff; margin: 0; font-family: 'Lora', Georgia, serif; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Ask Astro Raja</h2>
            </div>
            <div style="padding: 40px 30px; text-align: center;">
              <h3 style="margin-top: 0; color: #1e1b4b; font-family: 'Lora', Georgia, serif; font-size: 24px;">Hello <span style="color: #f59e0b;">${report.name}</span>,</h3>
              
              <p style="font-size: 16px; margin-bottom: 20px; text-align: left;">It has been exactly 24 hours since you received your personalized Life Transformation Report.</p>
              
              <p style="font-size: 16px; margin-bottom: 35px; text-align: left;">We deeply value your journey and would love to hear how the reading resonated with you. Did the insights provide clarity? Did the structural interventions make sense for your current life phase?</p>
              
              <a href="${feedbackUrl}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; font-weight: 600; font-size: 18px; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-family: 'Outfit', sans-serif; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.3);">
                Rate Your Reading
              </a>
              
              <p style="font-size: 14px; margin-top: 35px; color: #64748b; text-align: left;">It only takes a minute, and your feedback helps us continuously improve the precision of our spiritual guidance.</p>
              
              <p style="font-size: 16px; margin-top: 30px; margin-bottom: 0; text-align: left;">Warm regards,<br><strong style="color: #1e1b4b;">Astro Raja Team</strong></p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 25px; font-size: 13px; color: #64748b; font-family: 'Outfit', Arial, sans-serif;">
            <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Astro Raja. All rights reserved.</p>
            <p style="margin: 5px 0;">You received this because you requested a Life Transformation Report.</p>
          </div>
        </div>
      `
    });

    if (emailError) {
      console.error('Failed to send feedback email:', emailError);
      return new Response(JSON.stringify({ error: emailError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Feedback email sent successfully' }), { status: 200 });

  } catch (error: any) {
    console.error('Feedback Email Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
