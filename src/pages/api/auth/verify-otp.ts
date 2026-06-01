import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { SignJWT } from 'jose';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { mobile, email, otp, name } = await request.json();

    if ((!mobile && !email) || !otp) {
      return new Response(JSON.stringify({ error: 'Mobile or Email and OTP are required' }), { status: 400 });
    }

    // 1. Validate OTP
    let validOtp;
    if (email) {
      validOtp = await sql`
        SELECT id FROM otps 
        WHERE email = ${email} 
        AND otp_code = ${otp}
        AND is_used = FALSE
        AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
      `;
    } else {
      validOtp = await sql`
        SELECT id FROM otps 
        WHERE mobile_number = ${mobile} 
        AND otp_code = ${otp}
        AND is_used = FALSE
        AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
      `;
    }

    if (!validOtp || validOtp.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or expired OTP' }), { status: 401 });
    }

    // Mark OTP as used
    await sql`UPDATE otps SET is_used = TRUE WHERE id = ${validOtp[0].id}`;

    // 2. Get or Create User
    let userId;
    if (email) {
      const existingUser = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
      if (existingUser.length > 0) {
        userId = existingUser[0].id;
      } else {
        const newUser = await sql`INSERT INTO users (email) VALUES (${email}) RETURNING id`;
        userId = newUser[0].id;
      }
    } else {
      const existingUser = await sql`SELECT id FROM users WHERE mobile_number = ${mobile} LIMIT 1`;
      if (existingUser.length > 0) {
        userId = existingUser[0].id;
      } else {
        const newUser = await sql`INSERT INTO users (mobile_number) VALUES (${mobile}) RETURNING id`;
        userId = newUser[0].id;
      }
    }

    // 2.5 Create a profile for the user if 'name' is provided and no default profile exists
    if (name) {
      const existingProfile = await sql`SELECT id FROM profiles WHERE user_id = ${userId} AND relationship = 'Self' LIMIT 1`;
      if (existingProfile.length === 0) {
        await sql`
          INSERT INTO profiles (user_id, name, relationship) 
          VALUES (${userId}, ${name}, 'Self')
        `;
        console.log(`Created self profile for user ${userId} with name: ${name}`);
      }
    }

    // Retrieve full user record from DB to sign the token with absolute source-of-truth info
    const dbUser = await sql`SELECT mobile_number, email FROM users WHERE id = ${userId} LIMIT 1`;
    const userMobile = dbUser[0]?.mobile_number || null;
    const userEmail = dbUser[0]?.email || null;

    // 3. Generate secure JWT token
    const jwtSecret = new TextEncoder().encode(
      import.meta.env.JWT_SECRET || process.env.JWT_SECRET || 'fallback_secret'
    );

    const token = await new SignJWT({ userId, mobile: userMobile, email: userEmail })
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

