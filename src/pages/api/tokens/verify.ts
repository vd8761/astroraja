import type { APIRoute } from 'astro';
import crypto from 'crypto';
import sql from '../../../lib/db';
import { verifyAuthHeader } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Authenticate Request
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

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

    if (generated_signature !== razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Invalid payment signature' }), { status: 400 });
    }

    // 3. Prevent Duplicate Processing
    const existingTx = await sql`SELECT id FROM transactions WHERE razorpay_payment_id = ${razorpay_payment_id}`;
    if (existingTx.length > 0) {
      return new Response(JSON.stringify({ error: 'Payment already processed' }), { status: 400 });
    }

    // 4. Update Database
    const tokensToAdd = parseInt(import.meta.env.TOKEN_PACK_AMOUNT || process.env.TOKEN_PACK_AMOUNT || '10000');
    const priceInr = parseInt(import.meta.env.TOKEN_PACK_PRICE_INR || process.env.TOKEN_PACK_PRICE_INR || '99');
    
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

    // 5. Check for Referral Rewards
    // Get the user's referrer, if any
    const userInfo = await sql`SELECT referred_by FROM users WHERE id = ${user.userId as string}`;
    if (userInfo.length > 0 && userInfo[0].referred_by) {
      const referrerId = userInfo[0].referred_by;
      
      // Check if this was the user's first successful transaction
      const pastTxs = await sql`SELECT id FROM transactions WHERE user_id = ${user.userId as string} AND status = 'successful'`;
      
      // If pastTxs.length === 1, it means the transaction we JUST inserted is their first ever
      if (pastTxs.length === 1) {
        const REWARD_TOKENS = parseInt(import.meta.env.REFERRAL_REWARD_TOKENS || process.env.REFERRAL_REWARD_TOKENS || '10');
        
        // Add tokens to referrer
        await sql`
          UPDATE users 
          SET token_balance = COALESCE(token_balance, 0) + ${REWARD_TOKENS} 
          WHERE id = ${referrerId}
        `;
        
        // Log earning
        await sql`
          INSERT INTO referral_earnings (referrer_id, referred_user_id, tokens_awarded, trigger_transaction_id)
          VALUES (${referrerId}, ${user.userId as string}, ${REWARD_TOKENS}, ${transactionId})
        `;
        console.log(`Referral reward of ${REWARD_TOKENS} granted to ${referrerId} for referring ${user.userId}`);
      }
    }

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
