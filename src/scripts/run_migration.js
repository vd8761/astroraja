import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const dbUrl = envFile.split('\n').find(line => line.startsWith('DATABASE_URL=')).split('=')[1].trim();

const sql = neon(dbUrl);

async function run() {
  try {
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0`;
    console.log('Successfully added tokens_used column to reports table.');
  } catch (e) {
    console.error(e);
  }
}
run();
