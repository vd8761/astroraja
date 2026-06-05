import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { verifyAuthHeader } from '../../../lib/auth';
import { Resend } from 'resend';

// GET: Fetch all tickets for the authenticated user
export const GET: APIRoute = async ({ request }) => {
  try {
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const tickets = await sql`
      SELECT id, category, priority, subject, description, status, admin_reply as "adminReply", 
             created_at as timestamp
      FROM support_tickets
      WHERE user_id = ${user.userId as string}
      ORDER BY created_at DESC
    `;

    return new Response(JSON.stringify({ success: true, tickets }), { status: 200 });
  } catch (error: any) {
    console.error('Fetch Tickets Error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to fetch tickets' }), { status: 500 });
  }
};

// POST: Raise a new support ticket
export const POST: APIRoute = async ({ request }) => {
  try {
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const { id, category, priority, subject, description, status } = body;

    if (!id || !category || !priority || !subject || !description) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
    }

    // Insert support ticket mapped to authenticated user
    await sql`
      INSERT INTO support_tickets (id, user_id, category, priority, subject, description, status)
      VALUES (${id}, ${user.userId as string}, ${category}, ${priority}, ${subject}, ${description}, ${status || 'Under Review'})
    `;

    // Fetch user details for the admin email notification
    let userEmail = '';
    let userMobile = '';
    let countryCode = '';
    let userName = '';
    
    try {
      const userDetails = await sql`
        SELECT u.email, u.mobile_number, u.country_code,
          (SELECT name FROM profiles WHERE user_id = u.id ORDER BY created_at ASC LIMIT 1) as name
        FROM users u
        WHERE u.id = ${user.userId as string}
        LIMIT 1
      `;
      if (userDetails.length > 0) {
        userEmail = userDetails[0].email || '';
        userMobile = userDetails[0].mobile_number || '';
        countryCode = userDetails[0].country_code || '';
        userName = userDetails[0].name || '';
      }
    } catch (dbErr) {
      console.error('Error fetching user details for admin email notification:', dbErr);
    }

    // Send email notification to admin
    try {
      const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
      const resendFromEmail = import.meta.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'Ask Astro Raja <reports@askastroraja.com>';
      const adminMail = import.meta.env.ADMIN_MAIL || process.env.ADMIN_MAIL || 'ariyappan@touchmarkdes.com';
      const ccMail = import.meta.env.CC_MAIL || process.env.CC_MAIL || 'info@touchmarkdes.com';

      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        const origin = new URL(request.url).origin;

        console.log(`📧 Sending support ticket notification email to admin (${adminMail}) for ticket ${id}...`);
        const { error: emailError } = await resend.emails.send({
          from: resendFromEmail,
          to: adminMail,
          cc: ccMail,
          subject: `[New Support Ticket] ${subject}`,
          html: `
            <div style="background-color: #f8fafc; padding: 40px 20px; font-family: sans-serif; color: #1e293b; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 35px 30px; text-align: center; border-bottom: 4px solid #f59e0b;">
                  <div style="display: inline-block; padding: 6px 16px; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 9999px; color: #f59e0b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">
                    New Support Ticket
                  </div>
                  <h2 style="color: #ffffff; margin: 0; font-family: serif; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Cosmic Helpdesk</h2>
                </div>

                <!-- Body Content -->
                <div style="padding: 40px 30px;">
                  <p style="font-size: 16px; color: #475569; margin-top: 0; margin-bottom: 25px;">
                    A new support ticket has been submitted by a seeker. Here are the details:
                  </p>

                  <!-- Ticket Details Card -->
                  <div style="background-color: #faf8f5; border: 1px solid #f1f5f9; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #64748b; width: 120px; text-transform: uppercase; letter-spacing: 0.5px;">Ticket ID</td>
                        <td style="padding: 6px 0; font-size: 14px; font-family: monospace; font-weight: bold; color: #1e1b4b;">${id}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Seeker Name</td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #1e1b4b;">${userName || 'Guest User'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Contact info</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #1e1b4b;">
                          ${userEmail ? `${userEmail}` : ''}
                          ${userMobile ? `${userEmail ? ' • ' : ''}${countryCode || ''} ${userMobile}` : ''}
                          ${!userEmail && !userMobile ? '<span style="color: #94a3b8; font-style: italic;">No contact info</span>' : ''}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Category</td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #1e1b4b;">${category}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Priority</td>
                        <td style="padding: 6px 0; font-size: 14px;">
                          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; ${
                            priority === 'High' 
                              ? 'background-color: #fee2e2; color: #991b1b;' 
                              : priority === 'Medium' 
                                ? 'background-color: #fef3c7; color: #92400e;' 
                                : 'background-color: #f1f5f9; color: #334155;'
                          }">${priority}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0 6px 0; font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: top;">Subject</td>
                        <td style="padding: 12px 0 6px 0; font-size: 15px; font-weight: bold; color: #1e1b4b;">${subject}</td>
                      </tr>
                    </table>

                    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                      <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Description</div>
                      <div style="font-size: 14px; color: #334155; white-space: pre-wrap; background-color: #ffffff; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; line-height: 1.5;">${description}</div>
                    </div>
                  </div>

                  <!-- Action Button -->
                  <div style="text-align: center; margin: 35px 0 10px 0;">
                    <a href="https://askastroraja.com/admin" style="display: inline-block; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; font-size: 15px; font-weight: 700; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                      Manage & Reply to Ticket
                    </a>
                  </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                  <p style="margin: 0 0 5px 0;">&copy; ${new Date().getFullYear()} Ask Astro Raja. All rights reserved.</p>
                  <p style="margin: 0;">This is an automated operational email. Please do not reply directly to this message.</p>
                </div>
              </div>
            </div>
          `
        });

        if (emailError) {
          console.error('📧 Error sending support ticket notification email to admin:', emailError);
        } else {
          console.log(`📧 Support ticket notification email sent to admin for ticket ${id}`);
        }
      } else {
        console.warn('⚠️ Resend API Key is not set, skipping admin support ticket email notification.');
      }
    } catch (emailErr) {
      console.error('📧 Error preparing/sending admin support ticket email notification:', emailErr);
    }

    // Fetch and return the newly created ticket
    const ticketResult = await sql`
      SELECT id, category, priority, subject, description, status, admin_reply as "adminReply", 
             created_at as timestamp
      FROM support_tickets
      WHERE id = ${id}
      LIMIT 1
    `;

    if (ticketResult.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to retrieve created ticket' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, ticket: ticketResult[0] }), { status: 201 });
  } catch (error: any) {
    console.error('Create Ticket Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message || 'Failed to create ticket' }), { status: 500 });
  }
};
