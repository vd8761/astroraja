import type { APIRoute } from 'astro';
import sql from '../../lib/db';
import { qstash } from '../../lib/qstash';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    if (!data.name || !data.raasi || !data.lagnam || !data.email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract Client IP
    const ipHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const clientIp = ipHeader.split(',')[0].trim();

    // Generate random referral code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let newRefCode = '';
    for (let i = 0; i < 6; i++) {
      newRefCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Determine referrer if passed
    let referredById = null;
    if (data.referralCode && typeof data.referralCode === 'string') {
      const referrer = await sql`SELECT id FROM users WHERE referral_code = ${data.referralCode.trim().toUpperCase()} LIMIT 1`;
      if (referrer.length > 0) {
        referredById = referrer[0].id;
      }
    }

    // 1. Get or Create User
    let user_id;
    if (data.mobile) {
      const existing = await sql`SELECT id FROM users WHERE mobile_number = ${data.mobile} LIMIT 1`;
      if (existing.length > 0) {
        user_id = existing[0].id;
        await sql`UPDATE users SET email = ${data.email}, country_code = ${data.countryCode} WHERE id = ${user_id}`;
      } else {
        const inserted = await sql`INSERT INTO users (mobile_number, country_code, email, referral_code, referred_by) VALUES (${data.mobile}, ${data.countryCode}, ${data.email}, ${newRefCode}, ${referredById}) RETURNING id`;
        user_id = inserted[0].id;
      }
    } else {
      const inserted = await sql`INSERT INTO users (email, referral_code, referred_by) VALUES (${data.email}, ${newRefCode}, ${referredById}) RETURNING id`;
      user_id = inserted[0].id;
    }

    // 2. Create Profile
    const profiles = await sql`
      INSERT INTO profiles (user_id, name, raasi, lagnam, nakshatra, padam, relationship)
      VALUES (${user_id}, ${data.name}, ${data.raasi}, ${data.lagnam}, ${data.nakshatra || null}, ${data.padam || null}, 'Self')
      RETURNING id
    `;
    const profile_id = profiles[0].id;

    // 3. Create Report entry (status: queued)
    const enableMultiLanguage = import.meta.env.ENABLE_MULTI_LANGUAGE === 'true' || process.env.ENABLE_MULTI_LANGUAGE === 'true';
    const finalLanguage = enableMultiLanguage ? (data.language || 'English') : 'English';

    const reports = await sql`
      INSERT INTO reports (profile_id, user_id, language, form_data, status, price_paid, currency, ip_address)
      VALUES (${profile_id}, ${user_id}, ${finalLanguage}, ${JSON.stringify(data)}, 'queued', ${data.price_paid || 0}, ${data.currency || 'INR'}, ${clientIp})
      RETURNING id
    `;
    const report_id = reports[0].id;

    // 3.5 Check for Referral Rewards on Paid Reports
    if (data.price_paid > 0) {
      const userInfo = await sql`SELECT referred_by FROM users WHERE id = ${user_id}`;
      if (userInfo.length > 0 && userInfo[0].referred_by) {
        const referrerId = userInfo[0].referred_by;
        const pastReports = await sql`SELECT id FROM reports WHERE user_id = ${user_id} AND price_paid > 0`;
        
        // If this is their first paid report
        if (pastReports.length === 1) {
          const REWARD_TOKENS = parseInt(import.meta.env.REFERRAL_REWARD_TOKENS || process.env.REFERRAL_REWARD_TOKENS || '10');
          await sql`UPDATE users SET token_balance = COALESCE(token_balance, 0) + ${REWARD_TOKENS} WHERE id = ${referrerId}`;
          await sql`
            INSERT INTO referral_earnings (referrer_id, referred_user_id, tokens_awarded)
            VALUES (${referrerId}, ${user_id}, ${REWARD_TOKENS})
          `;
          console.log(`Referral reward of ${REWARD_TOKENS} granted to ${referrerId} for report ${report_id}`);
        }
      }
    }

    // 4. Send Job to QStash
    const baseUrl = new URL(request.url).origin;
    const processUrl = `${baseUrl}/api/process-reading`;
    
    await qstash.publishJSON({
      url: processUrl,
      body: { report_id },
      retries: 3
    });

    return new Response(JSON.stringify({ success: true, queued: true, report_id }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Queue Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to queue report' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
