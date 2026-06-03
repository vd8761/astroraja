import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { jwtVerify } from 'jose';

export const GET: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = new TextEncoder().encode(
      import.meta.env.JWT_SECRET || process.env.JWT_SECRET || 'fallback_secret'
    );

    const { payload } = await jwtVerify(token, jwtSecret);
    const affiliateId = payload.affiliateId as string;

    if (!affiliateId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Fetch stats
    const statsResult = await sql`
      WITH ReferrerStats AS (
        SELECT 
          COUNT(referred.id) as total_referred_users,
          SUM(CASE WHEN referred.commission_settled = true THEN 1 ELSE 0 END) as total_settled,
          SUM(CASE WHEN referred.commission_settled = false AND (SELECT COUNT(id) FROM reports WHERE user_id = referred.id AND price_paid > 0) > 0 THEN 1 ELSE 0 END) as pending_unsettled,
          (SELECT COALESCE(SUM(amount_paid), 0) FROM commission_settlements WHERE referrer_id = ${affiliateId}) as total_amount_paid,
          (SELECT currency FROM affiliates WHERE id = ${affiliateId}) as settlement_currency
        FROM users referred
        WHERE referred.referred_by = ${affiliateId}
      )
      SELECT * FROM ReferrerStats
    `;

    // Fetch individual referrals
    const referrals = await sql`
      SELECT 
        u.id,
        u.email,
        u.token_balance,
        CASE 
          WHEN u.mobile_number IS NOT NULL THEN CONCAT(SUBSTRING(u.mobile_number FROM 1 FOR 3), '******', SUBSTRING(u.mobile_number FROM LENGTH(u.mobile_number)-1 FOR 2))
          WHEN u.email IS NOT NULL THEN CONCAT(SUBSTRING(u.email FROM 1 FOR 2), '***@***.com')
          ELSE 'Unknown'
        END as contact_info,
        (SELECT p.name FROM profiles p WHERE p.user_id = u.id LIMIT 1) as profile_name,
        u.created_at as joined_date,
        u.commission_settled,
        (SELECT COUNT(r.id) FROM reports r WHERE r.user_id = u.id AND r.price_paid > 0) > 0 as has_converted
      FROM users u
      WHERE u.referred_by = ${affiliateId}
      ORDER BY u.created_at DESC
    `;

    // Fetch settlement history
    const settlements = await sql`
      SELECT 
        id, created_at, amount_paid, currency, referrals_covered_count, notes
      FROM commission_settlements 
      WHERE referrer_id = ${affiliateId}
      ORDER BY created_at DESC
    `;

    const rawStats = statsResult[0] || {};
    const stats = {
      total_referred_users: rawStats.total_referred_users || 0,
      total_settled: rawStats.total_settled || 0,
      pending_unsettled: rawStats.pending_unsettled || 0,
      total_amount_paid: rawStats.total_amount_paid || 0,
      settlement_currency: rawStats.settlement_currency || 'INR'
    };

    return new Response(JSON.stringify({ success: true, stats, referrals, settlements }), { status: 200 });

  } catch (error: any) {
    console.error('Affiliate Stats Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), { status: 500 });
  }
};
