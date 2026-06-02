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

    // 2. Fetch User Transactions
    const transactions = await sql`
      SELECT id, amount, currency, status, created_at, razorpay_payment_id, razorpay_order_id, tokens_added,
             COALESCE(transaction_type, 'purchase') as transaction_type
      FROM transactions 
      WHERE user_id = ${user.userId as string}
      ORDER BY created_at DESC
    `;

    return new Response(JSON.stringify({ 
      success: true, 
      transactions
    }), { status: 200 });

  } catch (error: any) {
    console.error('Transactions Fetch Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch transaction history' }), { status: 500 });
  }
};
