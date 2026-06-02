import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { mobile, email, type } = await request.json();

    if (!mobile && !email) {
      return new Response(JSON.stringify({ error: 'Mobile number or Email is required' }), { status: 400 });
    }

    // Check if user already exists when signing up, or if they exist when logging in
    if (type === 'signup') {
      if (email) {
        const existingEmail = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
        if (existingEmail.length > 0) {
          return new Response(JSON.stringify({ error: 'Email address is already registered.' }), { status: 400 });
        }
      }
      if (mobile) {
        const existingMobile = await sql`SELECT id FROM users WHERE mobile_number = ${mobile} LIMIT 1`;
        if (existingMobile.length > 0) {
          return new Response(JSON.stringify({ error: 'Phone number is already registered.' }), { status: 400 });
        }
      }
    } else {
      // Sign In / Login flow
      if (email) {
        const existingEmail = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
        if (existingEmail.length === 0) {
          return new Response(JSON.stringify({ error: 'No account found with this email. Please sign up first.' }), { status: 400 });
        }
      }
      if (mobile) {
        const existingMobile = await sql`SELECT id FROM users WHERE mobile_number = ${mobile} LIMIT 1`;
        if (existingMobile.length === 0) {
          return new Response(JSON.stringify({ error: 'No account found with this phone number. Please sign up first.' }), { status: 400 });
        }
      }
    }

    // 1. Rate Limiting Check (Max 3 requests per 15 minutes for the requested destination)
    if (mobile) {
      const recentMobileOtps = await sql`
        SELECT COUNT(*) as count 
        FROM otps 
        WHERE mobile_number = ${mobile} 
        AND created_at > NOW() - INTERVAL '15 minutes'
      `;
      if (parseInt(recentMobileOtps[0].count) >= 3) {
        return new Response(JSON.stringify({ 
          error: 'Too many OTP requests for this mobile number. Please wait 15 minutes.' 
        }), { status: 429 });
      }
    }

    if (email) {
      const recentEmailOtps = await sql`
        SELECT COUNT(*) as count 
        FROM otps 
        WHERE email = ${email} 
        AND created_at > NOW() - INTERVAL '15 minutes'
      `;
      if (parseInt(recentEmailOtps[0].count) >= 3) {
        return new Response(JSON.stringify({ 
          error: 'Too many OTP requests for this email. Please wait 15 minutes.' 
        }), { status: 429 });
      }
    }

    // 2. Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔑 [TESTING ONLY] Generated OTP for ${email || mobile || 'unknown'}: ${otpCode}`);

    // 3. Save to Database
    await sql`
      INSERT INTO otps (mobile_number, email, otp_code, expires_at)
      VALUES (${mobile || null}, ${email || null}, ${otpCode}, NOW() + INTERVAL '10 minutes')
    `;

    let responseMsg = 'OTP sent successfully';
    const responseData: any = { success: true };
    let emailSent = false;

    // 4. Send Email OTP if email is provided
    if (email) {
      const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
      const resendFromEmail = import.meta.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'Ask Astro Raja <reports@askastroraja.com>';

      if (!resendApiKey) {
        console.error('Resend configuration missing: RESEND_API_KEY not set');
        return new Response(JSON.stringify({ error: 'Email delivery is not configured' }), { status: 500 });
      }

      const resend = new Resend(resendApiKey);

      try {
        console.log(`📧 Sending OTP email via Resend to ${email}...`);
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: resendFromEmail,
          to: email,
          subject: 'Ask Astro Raja Verification Code',
          text: `Your verification code is ${otpCode}. It will expire in 10 minutes.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #0a192f; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #b8860b; text-align: center;">Ask Astro Raja Verification Code</h2>
              <p>Hello,</p>
              <p>Your one-time verification code (OTP) for Ask Astro Raja is:</p>
              <div style="text-align: center; margin: 30px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0a192f; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px dashed #cbd5e1;">
                ${otpCode}
              </div>
              <p>This code is valid for 10 minutes. Please do not share this code with anyone.</p>
              <p style="margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                If you did not request this code, you can safely ignore this email.
              </p>
            </div>
          `,
        });

        if (emailError) {
          throw new Error(emailError.message);
        }

        console.log(`📧 OTP Email sent successfully to ${email}. Message ID: ${emailData?.id}`);
        emailSent = true;
        responseMsg = 'OTP sent to email';
      } catch (emailErr: any) {
        console.error(`📧 Failed to deliver email to ${email}:`, emailErr);
        
        // If mobile is also provided, we don't throw an error so the request continues and sends SMS!
        if (!mobile) {
          return new Response(JSON.stringify({ error: `Email delivery failed: ${emailErr.message || emailErr}` }), { status: 500 });
        } else {
          responseMsg = 'Email failed, falling back to mobile';
        }
      }
    }

    // 5. Send Mobile OTP via SMPP Gateway if mobile is provided AND email was not successfully sent
    if (mobile && !emailSent) {
      // Clean mobile number (keep only digits)
      const cleanMobile = mobile.replace(/\D/g, '');
      const messageText = `Origin BI: Your OTP for login is ${otpCode}. This code is valid for 10 minutes. Do not share it with anyone.`;
      const encodedMsg = encodeURIComponent(messageText);
      const smsUrl = `http://smpp.webtechsolution.co/http-tokenkeyapi.php?authentic-key=37374f524947494e42493738351775316305&senderid=ORGNBI&route=1&number=${cleanMobile}&message=${encodedMsg}&templateid=1707177969382689358`;

      console.log(`\n\n📱 Sending real SMS OTP to ${cleanMobile}...\n\n`);
      try {
        const smsRes = await fetch(smsUrl);
        const smsText = await smsRes.text();
        console.log(`📱 SMS Gateway Response for ${cleanMobile}:`, smsText);
        responseMsg = email ? 'Email failed, sent to mobile' : 'OTP sent to mobile';
      } catch (smsErr: any) {
        console.error(`📱 Failed to send SMS via gateway:`, smsErr);
        return new Response(JSON.stringify({ error: `SMS delivery failed: ${smsErr.message || smsErr}` }), { status: 500 });
      }
    }

    responseData.message = responseMsg;
    return new Response(JSON.stringify(responseData), { status: 200 });

  } catch (error: any) {
    console.error('OTP Send Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send OTP' }), { status: 500 });
  }
};

