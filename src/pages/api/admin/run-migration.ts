import type { APIRoute } from 'astro';
import sql from '../../../lib/db';

export const GET: APIRoute = async () => {
  try {
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0`;
    return new Response(JSON.stringify({ success: true, message: 'tokens_used column added to reports table.' }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
