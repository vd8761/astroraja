import pg from 'pg';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const dbUrlLine = envContent.split('\n').find(line => line.trim().startsWith('DATABASE_URL='));

if (!dbUrlLine) {
  console.error("Error: DATABASE_URL not found in .env");
  process.exit(1);
}

const databaseUrl = dbUrlLine.split('DATABASE_URL=')[1].trim().replace(/['"]/g, '');

const pool = new pg.Pool({ connectionString: databaseUrl });

async function inspectForeignKeys() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT
          tc.table_schema, 
          tc.constraint_name, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_schema AS foreign_table_schema,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.delete_rule
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          JOIN information_schema.referential_constraints AS rc
            ON rc.constraint_name = tc.constraint_name
            AND rc.constraint_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users';
    `);
    
    console.log("Foreign Keys referencing 'users':");
    for (const row of res.rows) {
      console.log(`- Table: ${row.table_name}.${row.column_name} -> Constraint: ${row.constraint_name} (ON DELETE: ${row.delete_rule})`);
    }
  } catch (err) {
    console.error("Foreign key inspection failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

inspectForeignKeys();
