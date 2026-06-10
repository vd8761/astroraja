import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { verifyAuthHeader } from '../../../lib/auth';

export const DELETE: APIRoute = async ({ request }) => {
  try {
    // 1. Authenticate user
    const payload = await verifyAuthHeader(request);
    if (!payload) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const userId = payload.userId as string;

    // 2. Fetch active user record
    const users = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `;
    if (users.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const userRecord = users[0];
    const email = userRecord.email || null;
    const mobile = userRecord.mobile_number || null;

    // 3. Fetch related user data from other tables
    const profiles = await sql`SELECT * FROM profiles WHERE user_id = ${userId}`;
    const reports = await sql`SELECT * FROM reports WHERE user_id = ${userId}`;
    const transactions = await sql`SELECT * FROM transactions WHERE user_id = ${userId}`;
    
    // Query related tables safely in case they are missing or have errors
    let referral_earnings = [];
    try {
      referral_earnings = await sql`SELECT * FROM referral_earnings WHERE referrer_id = ${userId} OR referred_user_id = ${userId}`;
    } catch (e) {
      console.warn('Could not query referral_earnings:', e);
    }

    let notifications = [];
    try {
      notifications = await sql`SELECT * FROM notifications WHERE user_id = ${userId}`;
    } catch (e) {
      console.warn('Could not query notifications:', e);
    }

    let support_tickets = [];
    try {
      support_tickets = await sql`SELECT * FROM support_tickets WHERE user_id = ${userId}`;
    } catch (e) {
      console.warn('Could not query support_tickets:', e);
    }

    // 4. Construct the archive snapshot payload
    const userDataSnapshot = {
      user: userRecord,
      profiles,
      reports,
      transactions,
      referral_earnings,
      notifications,
      support_tickets
    };

    // 5. Insert the data into the archived_users table
    await sql`
      INSERT INTO archived_users (user_id, email, mobile_number, user_data)
      VALUES (${userId}, ${email}, ${mobile}, ${JSON.stringify(userDataSnapshot)})
    `;

    // 6. Delete the user (triggers CASCADE on profiles, reports, transactions, notifications, referral_earnings, and SET NULL on support_tickets)
    await sql`
      DELETE FROM users WHERE id = ${userId}
    `;

    console.log(`Successfully archived and deleted user: ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Account successfully deleted and archived'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error: any) {
    console.error('Delete Account Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500 });
  }
};
