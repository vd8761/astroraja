import type { APIRoute } from 'astro';
import Razorpay from 'razorpay';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Extract Client IP
    const ipHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const clientIp = ipHeader.split(',')[0].trim();
    
    let detectedCountry = 'UNKNOWN';
    
    // 1. Try Vercel country header first (standard for Vercel deployments)
    const vercelCountry = request.headers.get('x-vercel-ip-country');
    if (vercelCountry) {
      detectedCountry = vercelCountry.toUpperCase();
    }
    
    // 2. Query geolocation API if it's a public IP
    if (detectedCountry === 'UNKNOWN' && clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1' && !clientIp.startsWith('10.') && !clientIp.startsWith('192.168.')) {
      try {
        const geoRes = await fetch(`https://ipapi.co/${clientIp}/json/`).then(res => res.json());
        if (geoRes && geoRes.country_code) {
          detectedCountry = geoRes.country_code.toUpperCase();
        }
      } catch (e) {
        console.error(`Backend GeoIP lookup failed for IP ${clientIp}:`, e);
      }
    }
    
    // 3. Fall back to body parameter, or default to IN
    const finalCountryCode = detectedCountry !== 'UNKNOWN' ? detectedCountry : (data.countryCode || 'IN').toUpperCase();

    // Pricing Logic
    // Read amounts from environment variables, fallback to defaults
    const priceGlobal = parseInt(import.meta.env.RAZORPAY_PRICE_GLOBAL || process.env.RAZORPAY_PRICE_GLOBAL || '999');
    const priceIndia = parseInt(import.meta.env.RAZORPAY_PRICE_INDIA || process.env.RAZORPAY_PRICE_INDIA || '249');
    
    // INR price
    let amountInRupees = priceGlobal;
    if (finalCountryCode === 'IN') {
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
