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

    const expectedHash = crypto.scryptSync(adminPassword, 'admin_salt', 64).toString('hex');
    const authCookie = cookies.get('astro_admin_auth')?.value;

    if (authCookie !== expectedHash) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { ticketId, status, adminReply } = body;

    if (!ticketId || !status) {
      return new Response(JSON.stringify({ success: false, error: 'Missing ticketId or status' }), { status: 400 });
    }

    // Fetch ticket details (user_id and subject) first to generate a customized notification
    const ticketInfo = await sql`
      SELECT user_id, subject FROM support_tickets WHERE id = ${ticketId} LIMIT 1
    `;

    if (ticketInfo.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Ticket not found' }), { status: 404 });
    }

    const { user_id: userId, subject } = ticketInfo[0];

    // 3. Update status and admin reply in database
    await sql`
      UPDATE support_tickets 
      SET status = ${status}, 
          admin_reply = ${adminReply || null}, 
          updated_at = NOW() 
      WHERE id = ${ticketId}
    `;

    // 4. Create an in-app notification for the user
    if (userId) {
      const notiTitle = `Support Ticket Update: ${ticketId}`;
      const notiMessage = `Your ticket "${subject}" has been updated to "${status}".${adminReply ? ' Open the Support Center to view the response.' : ''}`;
      
      await sql`
        INSERT INTO notifications (user_id, title, message, category, action_type)
        VALUES (${userId}, ${notiTitle}, ${notiMessage}, 'Alert', 'chat')
      `;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Ticket updated successfully.' 
    }), { status: 200 });

  } catch (error: any) {
    console.error('Reply Ticket Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message || 'Internal server error' }), { status: 500 });
  }
};
