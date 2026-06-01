import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.DATABASE_URL || process.env.DATABASE_URL!);

export default sql;
