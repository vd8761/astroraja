import type { APIRoute } from 'astro';
import sql from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { referralCode } = await request.json();

    if (!referralCode || typeof referralCode !== 'string') {
      return new Response(JSON.stringify({ valid: false, error: 'Referral code is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const trimmedCode = referralCode.trim().toUpperCase();

    // Query user and check their "Self" profile to find their name
    const referrer = await sql`
      SELECT u.id, p.name 
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id AND p.relationship = 'Self'
      WHERE u.referral_code = ${trimmedCode} 
      LIMIT 1
    `;

    if (referrer.length > 0) {
      return new Response(JSON.stringify({
        valid: true,
        referrerName: referrer[0].name || 'Astro Raja User'
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        valid: false,
        error: 'Invalid referral code'
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error: any) {
    console.error('Validate Referral Error:', error);
    return new Response(JSON.stringify({ valid: false, error: 'Server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
