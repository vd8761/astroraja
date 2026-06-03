import type { APIRoute } from 'astro';
import sql from '../../lib/db';

export const GET: APIRoute = async () => {
  try {
    const affiliateId = 'a1fcde98-467a-422f-8a03-7f7229cb0ab4';
    const referrals = await sql`
      SELECT u.id, 
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
    return new Response(JSON.stringify(referrals));
  } catch(e) {
    return new Response(JSON.stringify({msg: String(e)}), {status:500});
  }
};
