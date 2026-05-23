import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { SignJWT } from 'jose';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { mobile, otp } = await request.json();

    if (!mobile || !otp) {
      return new Response(JSON.stringify({ error: 'Mobile and OTP are required' }), { status: 400 });
    }

    // 1. Validate OTP
    const validOtp = await sql`
      SELECT id FROM otps 
      WHERE mobile_number = ${mobile} 
      AND otp_code = ${otp}
      AND is_used = FALSE
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (validOtp.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or expired OTP' }), { status: 401 });
    }

    // Mark OTP as used
    await sql`UPDATE otps SET is_used = TRUE WHERE id = ${validOtp[0].id}`;

    // 2. Get or Create User
    let userId;
    const existingUser = await sql`SELECT id FROM users WHERE mobile_number = ${mobile} LIMIT 1`;
    
    if (existingUser.length > 0) {
      userId = existingUser[0].id;
    } else {
      const newUser = await sql`INSERT INTO users (mobile_number) VALUES (${mobile}) RETURNING id`;
      userId = newUser[0].id;
    }

    // 3. Generate secure JWT token
    const jwtSecret = new TextEncoder().encode(
      import.meta.env.JWT_SECRET || process.env.JWT_SECRET || 'fallback_secret'
    );

    const token = await new SignJWT({ userId, mobile })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d') // Token valid for 30 days
      .sign(jwtSecret);

    return new Response(JSON.stringify({ 
      success: true, 
      token,
      userId
    }), { status: 200 });

  } catch (error: any) {
    console.error('OTP Verify Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to verify OTP' }), { status: 500 });
  }
};
