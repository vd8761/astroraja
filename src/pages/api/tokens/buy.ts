import type { APIRoute } from 'astro';
import Razorpay from 'razorpay';
import { verifyAuthHeader } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Authenticate Request
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Check if Production Environment
    const isProduction = (import.meta.env.IS_PRODUCTION || process.env.IS_PRODUCTION) === 'true';

    // 2. Initialize Razorpay
    const key_id = isProduction ? (import.meta.env.RAZORPAY_PROD_KEY_ID || process.env.RAZORPAY_PROD_KEY_ID) : (import.meta.env.RAZORPAY_DEV_KEY_ID || process.env.RAZORPAY_DEV_KEY_ID);
    const key_secret = isProduction ? (import.meta.env.RAZORPAY_PROD_KEY_SECRET || process.env.RAZORPAY_PROD_KEY_SECRET) : (import.meta.env.RAZORPAY_DEV_KEY_SECRET || process.env.RAZORPAY_DEV_KEY_SECRET);
    
    if (!key_id || !key_secret) {
      return new Response(JSON.stringify({ error: 'Razorpay keys not configured' }), { status: 500 });
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    // 3. Define Price based on environment variable (in INR)
    const priceInrRaw = isProduction ? (import.meta.env.TOKEN_PROD_PRICE_INR || process.env.TOKEN_PROD_PRICE_INR) : (import.meta.env.TOKEN_DEV_PRICE_INR || process.env.TOKEN_DEV_PRICE_INR);
    const priceInr = parseInt(priceInrRaw || '99');

    // 4. Create Order
    const options = {
      amount: priceInr * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: `rcpt_${user.userId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    return new Response(JSON.stringify({ 
      success: true, 
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: key_id // Mobile app needs the public key to launch the checkout UI
    }), { status: 200 });

  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create order' }), { status: 500 });
  }
};
