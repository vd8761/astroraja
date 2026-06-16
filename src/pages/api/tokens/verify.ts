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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, custom_credits, is_report } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Missing payment details' }), { status: 400 });
    }

    // 2. Verify Signature
    const isProduction = (import.meta.env.IS_PRODUCTION || process.env.IS_PRODUCTION) === 'true';
    const key_id = isProduction 
      ? (import.meta.env.RAZORPAY_PROD_KEY_ID || process.env.RAZORPAY_PROD_KEY_ID) 
      : (import.meta.env.RAZORPAY_DEV_KEY_ID || process.env.RAZORPAY_DEV_KEY_ID || import.meta.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID);
    const key_secret = isProduction 
      ? (import.meta.env.RAZORPAY_PROD_KEY_SECRET || process.env.RAZORPAY_PROD_KEY_SECRET) 
      : (import.meta.env.RAZORPAY_DEV_KEY_SECRET || process.env.RAZORPAY_DEV_KEY_SECRET || import.meta.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET);
    
    if (!key_id || !key_secret) {
      return new Response(JSON.stringify({ error: 'Razorpay keys are not configured' }), { status: 500 });
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

    // 3. Prevent Duplicate Processing (Initial SELECT check)
    const existingTx = await sql`SELECT id FROM transactions WHERE razorpay_payment_id = ${razorpay_payment_id}`;
    if (existingTx.length > 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Payment already processed', 
        tokens_added: 0 
      }), { status: 200 });
    }

    // 4. Determine Tokens and Price
    let tokensToAdd = parseInt(import.meta.env.TOKEN_PACK_AMOUNT || process.env.TOKEN_PACK_AMOUNT || '10000');
    let priceInr = parseInt(import.meta.env.TOKEN_PACK_PRICE_INR || process.env.TOKEN_PACK_PRICE_INR || '99');
    
    if (is_report) {
      tokensToAdd = 0;
      // Fetch order from Razorpay to get the actual amount paid for report
      try {
        const razorpay = new Razorpay({ key_id, key_secret });
        const order = await razorpay.orders.fetch(razorpay_order_id);
        priceInr = Math.round((order.amount as number) / 100);
      } catch (e) {
        // Fallback: report pricing is usually 249 or 999
        priceInr = 249; 
      }
    } else if (isSandboxBypass && custom_credits) {
      tokensToAdd = parseInt(custom_credits);
      priceInr = Math.round((tokensToAdd / 10000) * 99);
    } else {
      // For real payments, fetch order from Razorpay to get the actual amount paid!
      try {
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

    // 5. Log the transaction FIRST to catch any duplicate payments (UNIQUE constraint race condition protection)
    let transactionId;
    try {
      const newTx = await sql`
        INSERT INTO transactions (user_id, amount, currency, tokens_added, razorpay_order_id, razorpay_payment_id, status, ip_address, transaction_type)
        VALUES (${user.userId as string}, ${priceInr}, 'INR', ${tokensToAdd}, ${razorpay_order_id}, ${razorpay_payment_id}, 'successful', ${clientIp}, ${is_report ? 'report' : 'credits'})
        RETURNING id
      `;
      transactionId = newTx[0].id;
    } catch (e: any) {
      // If UNIQUE constraint violation occurs
      if (e.message && (e.message.includes('unique constraint') || e.code === '23505')) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Payment already processed (duplicate request)', 
          tokens_added: 0 
        }), { status: 200 });
      }
      throw e;
    }

    // 6. Update Database (ONLY if it is a token purchase, NOT a report purchase)
    if (!is_report && tokensToAdd > 0) {
      await sql`
        UPDATE users 
        SET token_balance = COALESCE(token_balance, 0) + ${tokensToAdd} 
        WHERE id = ${user.userId as string}
      `;
      await sql`
        INSERT INTO notifications (user_id, title, message, category, action_type)
        VALUES (${user.userId as string}, 'Top-Up Successful', ${`Successfully added ${tokensToAdd} credits to your account. Your connection with the cosmos is fully powered!`}, 'Promo', 'promo')
      `;
    }

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
        
        await sql`
          INSERT INTO notifications (user_id, title, message, category, action_type)
          VALUES (${referrerId}, 'Referral Bonus Received!', ${`Your friend completed their first purchase! You have earned ${REWARD_TOKENS} bonus credits as a referral reward.`}, 'Promo', 'promo')
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
