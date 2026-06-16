import type { APIRoute } from 'astro';
import sql from '../../lib/db';
import { verifyAuthHeader } from '../../lib/auth';

export const GET: APIRoute = async ({ request }) => {
  try {
    // 1. Authenticate Request
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Parse Query Params
    const url = new URL(request.url);
    const orderId = url.searchParams.get('order_id');

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing order_id parameter' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Query Transactions table for the specific order under this user
    const tx = await sql`
      SELECT id, status, amount, tokens_added, transaction_type 
      FROM transactions 
      WHERE razorpay_order_id = ${orderId} AND user_id = ${user.userId as string}
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    if (tx.length === 0) {
      return new Response(JSON.stringify({ status: 'pending' }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const transaction = tx[0];
    if (transaction.status === 'successful') {
      return new Response(JSON.stringify({
        status: 'completed',
        transaction_id: transaction.id,
        amount: parseFloat(transaction.amount),
        tokens_added: transaction.tokens_added,
        type: transaction.transaction_type
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ status: 'pending' }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Payment Status API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
