import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import crypto from 'crypto';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Verify Admin Auth
    const adminPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return new Response(JSON.stringify({ success: false, error: 'Admin password not configured' }), { status: 401 });
    }

    const expectedHash = crypto.createHash('sha256').update(adminPassword).digest('hex');
    const authCookie = cookies.get('astro_admin_auth')?.value;

    if (authCookie !== expectedHash) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { referrer_id, amount, notes } = body;

    if (!referrer_id || !amount) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
    }

    // Fetch the affiliate's configured currency
    const affiliateResult = await sql`SELECT currency FROM affiliates WHERE id = ${referrer_id}`;
    if (affiliateResult.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Affiliate not found' }), { status: 404 });
    }
    const currency = affiliateResult[0].currency || 'INR';

    // 3. Find pending referrals for this referrer
    // A pending referral is a user who joined via this referrer, has at least one paid report, and is not settled.
    const pendingReferrals = await sql`
      SELECT id FROM users 
      WHERE referred_by = ${referrer_id} 
      AND commission_settled = false
      AND (SELECT COUNT(id) FROM reports WHERE user_id = users.id AND price_paid > 0) > 0
    `;

    if (pendingReferrals.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'No pending converted referrals found for this referrer.' }), { status: 400 });
    }

    const pendingIds = pendingReferrals.map(r => r.id);

    // 4. Update the pending referrals to settled
    await sql`
      UPDATE users 
      SET commission_settled = true, commission_settled_at = NOW() 
      WHERE id = ANY(${pendingIds})
    `;

    // 5. Insert settlement record
    await sql`
      INSERT INTO commission_settlements (referrer_id, amount_paid, currency, referrals_covered_count, notes)
      VALUES (${referrer_id}, ${amount}, ${currency}, ${pendingIds.length}, ${notes || null})
    `;

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully settled commissions for ${pendingIds.length} referrals.` 
    }), { status: 200 });

  } catch (error: any) {
    console.error('Settle Commission Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message || 'Internal server error' }), { status: 500 });
  }
};
