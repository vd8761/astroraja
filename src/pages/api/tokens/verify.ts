import type { APIRoute } from 'astro';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import sql from '../../../lib/db';
import { verifyAuthHeader } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Authenticate Request
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, custom_credits } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Missing payment details' }), { status: 400 });
    }

    // 2. Verify Signature
    const key_secret = import.meta.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return new Response(JSON.stringify({ error: 'Razorpay secret not configured' }), { status: 500 });
    }

    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    const isLocal = (process.env.DATABASE_URL || '').includes('localhost') || (process.env.DATABASE_URL || '').includes('127.0.0.1');
    const isSandboxBypass = isLocal && razorpay_signature === 'sandbox_test_bypass';

    if (generated_signature !== razorpay_signature && !isSandboxBypass) {
      return new Response(JSON.stringify({ error: 'Invalid payment signature' }), { status: 400 });
    }

    // 3. Prevent Duplicate Processing
    const existingTx = await sql`SELECT id FROM transactions WHERE razorpay_payment_id = ${razorpay_payment_id}`;
    if (existingTx.length > 0) {
      return new Response(JSON.stringify({ error: 'Payment already processed' }), { status: 400 });
    }

    // 4. Update Database
    let tokensToAdd = parseInt(import.meta.env.TOKEN_PACK_AMOUNT || process.env.TOKEN_PACK_AMOUNT || '10000');
    let priceInr = parseInt(import.meta.env.TOKEN_PACK_PRICE_INR || process.env.TOKEN_PACK_PRICE_INR || '99');
    
    if (isSandboxBypass && custom_credits) {
      tokensToAdd = parseInt(custom_credits);
      priceInr = Math.round((tokensToAdd / 10000) * 99);
    } else {
      // For real payments, fetch order from Razorpay to get the actual amount paid!
      try {
        const key_id = import.meta.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
        const razorpay = new Razorpay({ key_id, key_secret });
        const order = await razorpay.orders.fetch(razorpay_order_id);
        priceInr = Math.round((order.amount as number) / 100);
        tokensToAdd = Math.round(priceInr * (10000 / 99));
      } catch (e) {
        if (custom_credits) {
          tokensToAdd = parseInt(custom_credits);
          priceInr = Math.round((tokensToAdd / 10000) * 99);
        }
      }
    }
    
    // Extract Client IP
    const ipHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const clientIp = ipHeader.split(',')[0].trim();

    // Use a transaction if possible, but neon serverless sql handles simple queries. 
    // We will do them sequentially safely.
    
    // Add tokens to user
    await sql`
      UPDATE users 
      SET token_balance = COALESCE(token_balance, 0) + ${tokensToAdd} 
      WHERE id = ${user.userId as string}
    `;

    // Log the transaction
    const newTx = await sql`
      INSERT INTO transactions (user_id, amount, currency, tokens_added, razorpay_order_id, razorpay_payment_id, status, ip_address)
      VALUES (${user.userId as string}, ${priceInr}, 'INR', ${tokensToAdd}, ${razorpay_order_id}, ${razorpay_payment_id}, 'successful', ${clientIp})
      RETURNING id
    `;
    const transactionId = newTx[0].id;



    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Payment verified and tokens added successfully',
      tokens_added: tokensToAdd
    }), { status: 200 });

  } catch (error: any) {
    console.error('Razorpay Verify Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to verify payment' }), { status: 500 });
  }
};
