import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import * as nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { mobile, email } = await request.json();

    if (!mobile && !email) {
      return new Response(JSON.stringify({ error: 'Mobile number or Email is required' }), { status: 400 });
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

    // 3. Save to Database
    await sql`
      INSERT INTO otps (mobile_number, email, otp_code, expires_at)
      VALUES (${mobile || null}, ${email || null}, ${otpCode}, NOW() + INTERVAL '10 minutes')
    `;

    let responseMsg = 'OTP sent successfully';
    const responseData: any = { success: true };

    // 4. Send Email OTP if email is provided
    if (email) {
      const gmailUser = import.meta.env.GMAIL_USER || process.env.GMAIL_USER;
      const gmailPass = import.meta.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;

      if (!gmailUser || !gmailPass) {
        console.error('SMTP configuration missing: GMAIL_USER or GMAIL_APP_PASSWORD not set');
        return new Response(JSON.stringify({ error: 'Email delivery is not configured' }), { status: 500 });
      }

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      await transporter.sendMail({
        from: `"AstroRaja" <${gmailUser}>`,
        to: email,
        subject: 'AstroRaja Verification Code',
        text: `Your verification code is ${otpCode}. It will expire in 10 minutes.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #0a192f; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #b8860b; text-align: center;">AstroRaja Verification Code</h2>
            <p>Hello,</p>
            <p>Your one-time verification code (OTP) for AstroRaja is:</p>
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

      responseMsg = 'OTP sent to email';
    }

    // 5. Send Mobile OTP via SMPP Gateway if mobile is provided
    if (mobile) {
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
      } catch (smsErr) {
        console.error(`📱 Failed to send SMS via gateway:`, smsErr);
      }

      if (!email) {
        responseMsg = 'OTP sent to mobile';
      }
    }

    responseData.message = responseMsg;
    return new Response(JSON.stringify(responseData), { status: 200 });

  } catch (error: any) {
    console.error('OTP Send Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send OTP' }), { status: 500 });
  }
};

