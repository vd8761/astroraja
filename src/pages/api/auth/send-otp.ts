import type { APIRoute } from 'astro';
import sql from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { mobile } = await request.json();

    if (!mobile) {
      return new Response(JSON.stringify({ error: 'Mobile number is required' }), { status: 400 });
    }

    // 1. Rate Limiting Check (Max 3 requests per 15 minutes)
    const recentOtps = await sql`
      SELECT COUNT(*) as count 
      FROM otps 
      WHERE mobile_number = ${mobile} 
      AND created_at > NOW() - INTERVAL '15 minutes'
    `;
    
    if (parseInt(recentOtps[0].count) >= 3) {
      return new Response(JSON.stringify({ 
        error: 'Too many OTP requests. Please wait 15 minutes before trying again.' 
      }), { status: 429 });
    }

    // 2. Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Save to Database
    await sql`
      INSERT INTO otps (mobile_number, otp_code, expires_at)
      VALUES (${mobile}, ${otpCode}, NOW() + INTERVAL '10 minutes')
    `;

    // 4. Send SMS (Mocked for now)
    console.log(`\n\n📱 [MOCK SMS] Sending OTP ${otpCode} to ${mobile}\n\n`);
    
    // TODO: In production, integrate MSG91 or Twilio API here.

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'OTP sent successfully',
      _mock: true // just to let the frontend know we are in testing mode
    }), { status: 200 });

  } catch (error: any) {
    console.error('OTP Send Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send OTP' }), { status: 500 });
  }
};
