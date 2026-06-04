import { neon } from '@neondatabase/serverless';
import pg from 'pg';
import dns from 'node:dns';

// Fix local Node.js IPv6 resolution timeout issues (28-second fetch failed error)
dns.setDefaultResultOrder('ipv4first');

const databaseUrl = import.meta.env?.DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

let sql: any;

if (databaseUrl.includes('.neon.tech')) {
  // Production / Remote Neon database
  const neonSql = neon(databaseUrl);
  sql = async function(strings: TemplateStringsArray, ...values: any[]) {
    let attempt = 0;
    const maxRetries = 3;
    while (true) {
      try {
        return await neonSql(strings, ...values);
      } catch (e: any) {
        if (attempt < maxRetries && e.message && e.message.includes('fetch failed')) {
          attempt++;
          console.warn(`Neon fetch failed, retrying attempt ${attempt}...`);
          await new Promise(res => setTimeout(res, 1000 * attempt));
          continue;
        }
        throw e;
      }
    }
  };
} else {
  // Local PostgreSQL database
  const pool = new pg.Pool({ connectionString: databaseUrl });
  
  // Tagged template handler to mimic Neon's serverless SQL API
  sql = async function(strings: TemplateStringsArray, ...values: any[]) {
    let queryText = '';
    for (let i = 0; i < strings.length; i++) {
      queryText += strings[i];
      if (i < values.length) {
        queryText += `$${i + 1}`;
      }
    }
    
    const client = await pool.connect();
    try {
      const res = await client.query(queryText, values);
      return res.rows;
    } finally {
      client.release();
    }
  };
}

export default sql;
