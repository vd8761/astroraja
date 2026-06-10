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
    console.log("Running migration: Creating archived_users table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS archived_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        email VARCHAR(255),
        mobile_number VARCHAR(20),
        user_data JSONB NOT NULL,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Migration successful: Table 'archived_users' is ready.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
