import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    const reports = await sql`
      SELECT r.id, r.status, u.email, r.created_at 
      FROM reports r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC 
      LIMIT 5
    `;
    console.log("Recent Reports:");
    console.table(reports);
  } catch(e) {
    console.error(e);
  }
}

main();
