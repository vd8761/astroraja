import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { verifyAuthHeader } from '../../../lib/auth';

export const GET: APIRoute = async ({ request }) => {
  try {
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const userId = user.userId as string;

    // Fetch user details
    const userInfo = await sql`SELECT referral_code, token_balance FROM users WHERE id = ${userId}`;
    if (userInfo.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const { referral_code, token_balance } = userInfo[0];

    // Fetch friends referred count (from users table where referred_by = userId)
    const referredUsers = await sql`SELECT count(id) FROM users WHERE referred_by = ${userId}`;
    const friendsReferred = parseInt(referredUsers[0].count) || 0;

    return new Response(JSON.stringify({
      success: true,
      referralCode: referral_code,
      tokenBalance: token_balance,
      friendsReferred
    }), { status: 200 });

  } catch (error: any) {
    console.error('Referral Stats Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch referral stats' }), { status: 500 });
  }
};
