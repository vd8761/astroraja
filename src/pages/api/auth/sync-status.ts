import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { verifyAuthHeader } from '../../../lib/auth';

export const GET: APIRoute = async ({ request }) => {
  try {
    // 1. Authenticate user
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const userId = user.userId as string;

    // 2. Fetch all profiles for this user from database
    const dbProfiles = await sql`
      SELECT id, name, raasi, lagnam, nakshatra, relationship as relation, padam
      FROM profiles
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `;

    // 3. Check if the user has any completed report
    const dbReports = await sql`
      SELECT id FROM reports
      WHERE user_id = ${userId} AND status = 'completed'
      LIMIT 1
    `;
    const hasGeneratedReport = dbReports.length > 0;

    return new Response(JSON.stringify({
      success: true,
      hasGeneratedReport,
      profiles: dbProfiles
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error: any) {
    console.error('Sync Status Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500 });
  }
};
