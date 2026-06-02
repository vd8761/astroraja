import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { verifyAuthHeader } from '../../../lib/auth';

export const GET: APIRoute = async ({ request }) => {
  try {
    // 1. Authenticate Request
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 2. Fetch User Token Balance
    const userRecord = await sql`
      SELECT token_balance 
      FROM users 
      WHERE id = ${user.userId as string}
    `;

    const tokenBalance = userRecord[0]?.token_balance ?? 0;

    return new Response(JSON.stringify({ 
      success: true, 
      token_balance: tokenBalance
    }), { status: 200 });

  } catch (error: any) {
    console.error('Balance Fetch Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch balance' }), { status: 500 });
  }
};
