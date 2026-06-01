import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env?.DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const sql = neon(databaseUrl);

export default sql;
