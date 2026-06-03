import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const channelLink = import.meta.env.PUBLIC_WHATSAPP_CHANNEL_LINK || 'https://whatsapp.com/channel/0029VbDC2pc1NCrNUHbNx83u';

  if (!userId) {
    // If no userId is provided, just redirect to the channel
    return Response.redirect(channelLink, 302);
  }

  try {
    const sql = neon(import.meta.env.DATABASE_URL);
    
    // Update the user record to indicate they clicked the WhatsApp channel link
    await sql`
      UPDATE users 
      SET whatsapp_channel_joined = TRUE 
      WHERE id = ${userId}
    `;
    
    return Response.redirect(channelLink, 302);
  } catch (error) {
    console.error('Error recording WhatsApp channel join:', error);
    // Still redirect even if tracking fails
    return Response.redirect(channelLink, 302);
  }
};
