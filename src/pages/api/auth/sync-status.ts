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

    // 4. Check if the user has paid for more reports than they have generated
    const txRes = await sql`
      SELECT COUNT(*)::integer as count FROM transactions
      WHERE user_id = ${userId} AND transaction_type = 'report' AND status = 'successful'
    `;
    const txCount = parseInt(txRes[0]?.count?.toString() || '0', 10);

    const reportsRes = await sql`
      SELECT COUNT(*)::integer as count FROM reports
      WHERE user_id = ${userId} AND status != 'failed'
    `;
    const reportsCount = parseInt(reportsRes[0]?.count?.toString() || '0', 10);

    const hasPaidReport = txCount > reportsCount;

    return new Response(JSON.stringify({
      success: true,
      hasGeneratedReport,
      hasPaidReport,
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
