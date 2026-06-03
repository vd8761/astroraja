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

    // Determine referrer if passed
    let referredById = null;
    if (data.referralCode && typeof data.referralCode === 'string') {
      const referrer = await sql`SELECT id FROM affiliates WHERE referral_code = ${data.referralCode.trim().toUpperCase()} LIMIT 1`;
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
        // Fallback: check if they already registered with this email
        const existingEmail = await sql`SELECT id FROM users WHERE email = ${data.email} LIMIT 1`;
        if (existingEmail.length > 0) {
          user_id = existingEmail[0].id;
          await sql`UPDATE users SET mobile_number = ${data.mobile}, country_code = ${data.countryCode} WHERE id = ${user_id}`;
        } else {
          const inserted = await sql`
            INSERT INTO users (mobile_number, country_code, email, referred_by) 
            VALUES (${data.mobile}, ${data.countryCode}, ${data.email}, ${referredById}) 
            RETURNING id
          `;
          user_id = inserted[0].id;
        }
      }
    } else {
      const existing = await sql`SELECT id FROM users WHERE email = ${data.email} LIMIT 1`;
      if (existing.length > 0) {
        user_id = existing[0].id;
      } else {
        const inserted = await sql`
          INSERT INTO users (email, referred_by) 
          VALUES (${data.email}, ${referredById}) 
          RETURNING id
        `;
        user_id = inserted[0].id;
      }
    }

    // 1.5 Save WhatsApp Number if provided
    if (data.whatsappNumber) {
      await sql`
        UPDATE users 
        SET whatsapp_number = ${data.whatsappNumber}, whatsapp_country_code = ${data.whatsappCountryCode || data.countryCode} 
        WHERE id = ${user_id}
      `;
    }

    // 2. Create Profile
    const relationship = data.relationship || 'Self';
    const profiles = await sql`
      INSERT INTO profiles (user_id, name, raasi, lagnam, nakshatra, padam, relationship)
      VALUES (${user_id}, ${data.name}, ${data.raasi}, ${data.lagnam}, ${data.nakshatra || null}, ${data.padam || null}, ${relationship})
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



    // 4. Send Job to QStash (Bypass in local development to avoid QStash delivery failure)
    const baseUrl = new URL(request.url).origin;
    const processUrl = `${baseUrl}/api/process-reading`;
    const isLocalDev = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1') || baseUrl.includes('10.') || baseUrl.includes('192.168.');

    if (isLocalDev) {
      console.log(`[Queue Reading] 🏠 Local environment detected (${baseUrl}). Running report generation locally in background...`);
      (async () => {
        try {
          const { POST: processReading } = await import('./process-reading');
          const fakeReq = new Request(processUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ report_id }),
          });
          const res = await processReading({ request: fakeReq } as any);
          if (!res.ok) {
            console.error('[Queue Reading] ❌ Local process-reading fallback failed with status:', res.status, await res.text());
          }
        } catch (localErr) {
          console.error('[Queue Reading] ❌ Local process-reading fallback error:', localErr);
        }
      })();
    } else {
      try {
        await qstash.publishJSON({
          url: processUrl,
          body: { report_id },
          retries: 3
        });
      } catch (qstashError: any) {
        console.warn('[Queue Reading] ⚠️ QStash publish failed. Running report generation locally in the background:', qstashError.message || qstashError);
        
        // Async trigger of local process-reading in the background
        (async () => {
          try {
            const { POST: processReading } = await import('./process-reading');
            const fakeReq = new Request(processUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ report_id }),
            });
            const res = await processReading({ request: fakeReq } as any);
            if (!res.ok) {
              console.error('[Queue Reading] ❌ Local process-reading fallback failed with status:', res.status, await res.text());
            }
          } catch (localErr) {
            console.error('[Queue Reading] ❌ Local process-reading fallback error:', localErr);
          }
        })();
      }
    }

    return new Response(JSON.stringify({ success: true, queued: true, report_id, userId: user_id }), { 
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
