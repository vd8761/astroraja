import type { APIRoute } from 'astro';
import Razorpay from 'razorpay';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const countryCode = data.countryCode || 'UNKNOWN';

    // Pricing Logic
    // Read amounts from environment variables, fallback to defaults
    const priceGlobal = parseInt(import.meta.env.RAZORPAY_PRICE_GLOBAL || process.env.RAZORPAY_PRICE_GLOBAL || '999');
    const priceIndia = parseInt(import.meta.env.RAZORPAY_PRICE_INDIA || process.env.RAZORPAY_PRICE_INDIA || '249');
    
    // INR price
    let amountInRupees = priceGlobal;
    if (countryCode.toUpperCase() === 'IN') {
      amountInRupees = priceIndia;
    }
    // Razorpay expects the amount in the smallest currency sub-unit (paise for INR).
    const amountInPaise = amountInRupees * 100;

    const keyId = import.meta.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = import.meta.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      // Return a 500 error if keys are missing
      return new Response(JSON.stringify({ error: 'Razorpay keys are not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await instance.orders.create(options);

    return new Response(JSON.stringify({ 
      success: true, 
      orderId: order.id, 
      amount: amountInPaise,
      currency: "INR",
      keyId: keyId // Safe to send public key to frontend for checkout initialization
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
