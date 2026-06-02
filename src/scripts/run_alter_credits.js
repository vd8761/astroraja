import pg from 'pg';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const dbUrl = envFile.split('\n').find(line => line.startsWith('DATABASE_URL=')).split('=')[1].trim();

console.log('Connecting to database:', dbUrl);
const pool = new pg.Pool({ connectionString: dbUrl });

async function run() {
  const client = await pool.connect();
  try {
    console.log('Running ALTER TABLE command to set default credits to 10000...');
    await client.query('ALTER TABLE users ALTER COLUMN token_balance SET DEFAULT 10000');
    console.log('Altered column default successfully.');

    console.log('Updating existing users with 0, null, or 100 token balance to 10000...');
    const res = await client.query('UPDATE users SET token_balance = 10000 WHERE token_balance IS NULL OR token_balance = 0 OR token_balance = 100');
    console.log(`Update completed successfully. Updated ${res.rowCount} rows.`);
  } catch (e) {
    console.error('Migration error:', e);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
