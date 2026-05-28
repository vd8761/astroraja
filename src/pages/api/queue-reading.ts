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

    // 1. Get or Create User
    let user_id;
    if (data.mobile) {
      const existing = await sql`SELECT id FROM users WHERE mobile_number = ${data.mobile} LIMIT 1`;
      if (existing.length > 0) {
        user_id = existing[0].id;
        await sql`UPDATE users SET email = ${data.email} WHERE id = ${user_id}`;
      } else {
        const inserted = await sql`INSERT INTO users (mobile_number, email) VALUES (${data.mobile}, ${data.email}) RETURNING id`;
        user_id = inserted[0].id;
      }
    } else {
      const inserted = await sql`INSERT INTO users (email) VALUES (${data.email}) RETURNING id`;
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
