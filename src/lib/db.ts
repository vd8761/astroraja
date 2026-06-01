import { neon } from '@neondatabase/serverless';
import pg from 'pg';

const databaseUrl = import.meta.env?.DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

let sql: any;

if (databaseUrl.includes('.neon.tech')) {
  // Production / Remote Neon database
  sql = neon(databaseUrl);
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
