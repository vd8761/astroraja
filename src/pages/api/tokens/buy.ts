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

    // 2. Initialize Razorpay
    const key_id = import.meta.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const key_secret = import.meta.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      return new Response(JSON.stringify({ error: 'Razorpay keys not configured' }), { status: 500 });
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    // 3. Parse Custom Credits & Price
    let customCredits = 10000;
    try {
      const clonedRequest = request.clone();
      const body = await clonedRequest.json();
      if (body.custom_credits) {
        customCredits = parseInt(body.custom_credits);
      }
    } catch (e) {
      // Fallback to default
    }

    if (customCredits > 100000) {
      return new Response(JSON.stringify({ error: 'Maximum credit pack limit is 100,000 Credits' }), { status: 400 });
    }
    if (customCredits < 100) {
      return new Response(JSON.stringify({ error: 'Minimum credit purchase is 100 Credits' }), { status: 400 });
    }

    const basePrice = parseInt(import.meta.env.TOKEN_PACK_PRICE_INR || process.env.TOKEN_PACK_PRICE_INR || '99');
    const priceInr = Math.round((customCredits / 10000) * basePrice);

    // 4. Create Order
    const options = {
      amount: priceInr * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: `rcpt_${(user.userId as string).substring(0, 8)}_${Date.now().toString().substring(5)}`
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
