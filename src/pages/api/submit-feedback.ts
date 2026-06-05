import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import sql from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { report_id, rating, message } = data;

    if (!report_id) {
      return new Response(JSON.stringify({ error: 'Missing report ID' }), { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Invalid rating (must be 1-5)' }), { status: 400 });
    }

    // 1. Verify report exists and get user info
    const rows = await sql`
      SELECT r.id, p.name, u.email
      FROM reports r
      JOIN profiles p ON r.profile_id = p.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ${report_id}
    `;

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Report not found' }), { status: 404 });
    }

    const report = rows[0];

    // 2. Check if feedback already exists to prevent duplicates
    const existingFeedback = await sql`SELECT id FROM feedbacks WHERE report_id = ${report_id}`;
    if (existingFeedback.length > 0) {
      return new Response(JSON.stringify({ error: 'Feedback has already been submitted for this report.' }), { status: 400 });
    }

    // 3. Insert feedback into database
    await sql`
      INSERT INTO feedbacks (report_id, rating, message)
      VALUES (${report_id}, ${rating}, ${message || null})
    `;

    // 4. Send Admin Notification Email
    const resend = new Resend(import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY);
    const adminEmail = import.meta.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'reports@astroraja.com';
    // Send TO the admin email (you) so you know they left a review
    
    // Convert 1-5 to stars string
    const stars = '⭐'.repeat(rating);

    const { error: emailError } = await resend.emails.send({
      from: adminEmail,
      to: adminEmail,
      subject: `New Feedback Received: ${rating} Stars! (${report.name})`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
          <h2 style="color: #1e1b4b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">New Customer Feedback Received</h2>
          
          <p><strong>Customer Name:</strong> ${report.name}</p>
          <p><strong>Customer Email:</strong> ${report.email}</p>
          <p><strong>Rating:</strong> ${stars} (${rating}/5)</p>
          
          <div style="background-color: #f9f9f9; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"${message || 'No written message provided.'}"</p>
          </div>
          
          <p style="font-size: 12px; color: #888;">Report ID: ${report_id}</p>
        </div>
      `
    });

    if (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // We don't fail the user request if the admin email fails
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: any) {
    console.error('Submit Feedback Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
