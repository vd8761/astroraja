import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Parse DATABASE_URL from .env file manually to avoid env loading issues
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const dbUrlLine = envContent.split('\n').find(line => line.trim().startsWith('DATABASE_URL='));

if (!dbUrlLine) {
  console.error("Error: DATABASE_URL not found in .env");
  process.exit(1);
}

const databaseUrl = dbUrlLine.split('DATABASE_URL=')[1].trim().replace(/['"]/g, '');

console.log("Connecting to database...");
const pool = new pg.Pool({ connectionString: databaseUrl });

async function run() {
  const client = await pool.connect();
  try {
    console.log("Running migration: Creating support_tickets table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(50) PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        category VARCHAR(100) NOT NULL,
        priority VARCHAR(50) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Under Review',
        admin_reply TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Migration successful: Table 'support_tickets' is ready.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
