import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import crypto from 'crypto';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Verify Admin Auth
    const adminPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return new Response(JSON.stringify({ success: false, error: 'Admin password not configured' }), { status: 401 });
    }

    const expectedHash = crypto.scryptSync(adminPassword, 'admin_salt', 64).toString('hex');
    const authCookie = cookies.get('astro_admin_auth')?.value;

    if (authCookie !== expectedHash) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { name, mobile_number, country_code, email, referral_code, password, currency, commissionType, commissionValue } = body;

    if (!mobile_number || !email || !referral_code || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
    }

    // 3. Hash the affiliate password
    const password_hash = crypto.scryptSync(password, 'astroraja_salt', 64).toString('hex');

    // 4. Ensure referral_code is unique
    const upperRefCode = referral_code.trim().toUpperCase();
    const existingRef = await sql`SELECT id FROM affiliates WHERE referral_code = ${upperRefCode}`;
    if (existingRef.length > 0) {
      return new Response(JSON.stringify({ success: false, error: 'Referral code already exists' }), { status: 400 });
    }

    // Ensure email or mobile is unique
    const existingUser = await sql`
      SELECT id FROM affiliates 
      WHERE email = ${email.trim()} OR mobile_number = ${mobile_number.trim()}
    `;
    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ success: false, error: 'Affiliate with this email or mobile already exists' }), { status: 400 });
    }

    // 5. Insert into database
    await sql`
      INSERT INTO affiliates (name, mobile_number, country_code, email, referral_code, password_hash, currency, commission_type, commission_value)
      VALUES (
        ${name?.trim() || null}, 
        ${mobile_number.trim()}, 
        ${country_code?.trim() || null}, 
        ${email.trim()}, 
        ${upperRefCode}, 
        ${password_hash},
        ${currency || 'INR'},
        ${commissionType || 'fixed'},
        ${parseFloat(commissionValue) || 0}
      )
    `;

    // 6. Send Welcome Email
    const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    const resendFromEmail = import.meta.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'Ask Astro Raja <reports@askastroraja.com>';
    
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      try {
        const loginUrl = `${new URL(request.url).origin}/affiliate`;
        await resend.emails.send({
          from: resendFromEmail,
          to: email.trim(),
          subject: 'Welcome to Ask Astro Raja Affiliate Program!',
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
              <h3 style="margin-top: 0; color: #1e1b4b; font-family: 'Lora', Georgia, serif; font-size: 22px;">Hello <span style="color: #f59e0b;">${name || 'Partner'}</span>,</h3>
              <p style="font-size: 16px; margin-bottom: 20px;">Your affiliate account has been successfully created. You can now start earning commissions by referring people to our life-changing AI reports.</p>
              
              <div style="background-color: #faf8f5; padding: 25px; border-left: 4px solid #f59e0b; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 10px 0; font-size: 16px; color: #1e1b4b;"><strong>Your Referral Code:</strong> <span style="font-family: monospace; color: #f59e0b; font-size: 18px;">${upperRefCode}</span></p>
                <p style="margin: 0 0 10px 0; font-size: 16px; color: #1e1b4b;"><strong>Login Email:</strong> <span style="color: #2563eb;">${email.trim()}</span></p>
                <p style="margin: 0; font-size: 16px; color: #1e1b4b;"><strong>Password:</strong> <span style="font-family: monospace;">${password}</span></p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${loginUrl}" style="background-color: #1e1b4b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Login Now</a>
              </div>

              <p style="font-size: 15px; margin-bottom: 10px; color: #475569;">Please keep this email safe and do not share your password with anyone.</p>
              <p style="font-size: 15px; margin-top: 30px; margin-bottom: 0;">Warm regards,<br><strong style="color: #1e1b4b;">Astro Raja Team</strong></p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 25px; font-size: 13px; color: #64748b; font-family: 'Outfit', Arial, sans-serif;">
            <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Astro Raja. All rights reserved.</p>
            <p style="margin: 5px 0;">You are receiving this email because your affiliate account was created by an admin.</p>
          </div>
        </div>
          `,
        });
        console.log(`Welcome email sent to new affiliate: ${email}`);
      } catch (err) {
        console.error('Failed to send welcome email to affiliate:', err);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Affiliate account created successfully.' 
    }), { status: 200 });

  } catch (error: any) {
    console.error('Create Affiliate Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message || 'Internal server error' }), { status: 500 });
  }
};
