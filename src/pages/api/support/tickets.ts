import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { verifyAuthHeader } from '../../../lib/auth';

// GET: Fetch all tickets for the authenticated user
export const GET: APIRoute = async ({ request }) => {
  try {
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const tickets = await sql`
      SELECT id, category, priority, subject, description, status, admin_reply as "adminReply", 
             created_at as timestamp
      FROM support_tickets
      WHERE user_id = ${user.userId as string}
      ORDER BY created_at DESC
    `;

    return new Response(JSON.stringify({ success: true, tickets }), { status: 200 });
  } catch (error: any) {
    console.error('Fetch Tickets Error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to fetch tickets' }), { status: 500 });
  }
};

// POST: Raise a new support ticket
export const POST: APIRoute = async ({ request }) => {
  try {
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const { id, category, priority, subject, description, status } = body;

    if (!id || !category || !priority || !subject || !description) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
    }

    // Insert support ticket mapped to authenticated user
    await sql`
      INSERT INTO support_tickets (id, user_id, category, priority, subject, description, status)
      VALUES (${id}, ${user.userId as string}, ${category}, ${priority}, ${subject}, ${description}, ${status || 'Under Review'})
    `;

    // Fetch and return the newly created ticket
    const ticketResult = await sql`
      SELECT id, category, priority, subject, description, status, admin_reply as "adminReply", 
             created_at as timestamp
      FROM support_tickets
      WHERE id = ${id}
      LIMIT 1
    `;

    if (ticketResult.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to retrieve created ticket' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, ticket: ticketResult[0] }), { status: 201 });
  } catch (error: any) {
    console.error('Create Ticket Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message || 'Failed to create ticket' }), { status: 500 });
  }
};
