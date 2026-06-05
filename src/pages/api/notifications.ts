import type { APIRoute } from 'astro';
import sql from '../../lib/db';
import { verifyAuthHeader } from '../../lib/auth';

export const GET: APIRoute = async ({ request }) => {
  try {
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const userId = user.userId as string;

    // Fetch user notifications from the last 7 days
    const notifications = await sql`
      SELECT id, title, message, category, action_type as "actionType", is_read as "isRead", created_at as "timestamp"
      FROM notifications
      WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
    `;

    return new Response(JSON.stringify({
      success: true,
      notifications
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Notifications Fetch Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch notifications' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const userId = user.userId as string;
    const body = await request.json().catch(() => ({}));
    const { id, all } = body;

    if (all) {
      await sql`
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE user_id = ${userId}
      `;
    } else if (id) {
      await sql`
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE id = ${id} AND user_id = ${userId}
      `;
    } else {
      return new Response(JSON.stringify({ error: 'Missing parameters. Provide "id" or "all": true' }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Notifications Update Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update notifications' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const userId = user.userId as string;
    const body = await request.json().catch(() => ({}));
    const { id, all } = body;

    if (all) {
      await sql`
        DELETE FROM notifications 
        WHERE user_id = ${userId}
      `;
    } else if (id) {
      await sql`
        DELETE FROM notifications 
        WHERE id = ${id} AND user_id = ${userId}
      `;
    } else {
      return new Response(JSON.stringify({ error: 'Missing parameters. Provide "id" or "all": true' }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Notifications Delete Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete notifications' }), { status: 500 });
  }
};
