import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import crypto from 'crypto';
import { SignJWT } from 'jose';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, mobile_number, password } = body;

    if ((!email && !mobile_number) || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Email/Mobile and password are required' }), { status: 400 });
    }

    // Find the affiliate
    let affiliates;
    if (email) {
      affiliates = await sql`SELECT id, password_hash, name, referral_code FROM affiliates WHERE email = ${email.trim()} LIMIT 1`;
    } else {
      const cleanMobile = mobile_number.replace(/\D/g, '').slice(-10);
      affiliates = await sql`SELECT id, password_hash, name, referral_code FROM affiliates WHERE mobile_number = ${cleanMobile} LIMIT 1`;
    }

    if (affiliates.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), { status: 401 });
    }

    const affiliate = affiliates[0];

    // Verify password
    let hashedInput = crypto.scryptSync(password, 'astroraja_salt', 64).toString('hex');
    
    // Fallback for existing affiliates with legacy sha256 password hashes
    if (affiliate.password_hash.length === 64) {
      hashedInput = crypto.createHash('sha256').update(password).digest('hex');
    }

    if (hashedInput !== affiliate.password_hash) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), { status: 401 });
    }

    // Generate JWT token
    const jwtSecret = new TextEncoder().encode(
      import.meta.env.JWT_SECRET || process.env.JWT_SECRET || 'fallback_secret'
    );

    const token = await new SignJWT({ affiliateId: affiliate.id, isAffiliate: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(jwtSecret);

    return new Response(JSON.stringify({ 
      success: true, 
      token,
      name: affiliate.name,
      referral_code: affiliate.referral_code
    }), { status: 200 });

  } catch (error: any) {
    console.error('Affiliate Login Error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { status: 500 });
  }
};
