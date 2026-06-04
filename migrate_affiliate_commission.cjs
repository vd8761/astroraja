const fs = require('fs');
const { neon } = require('@neondatabase/serverless');
const dbUrl = fs.readFileSync('.env', 'utf8').match(/DATABASE_URL=(.*)/)[1];
const sql = neon(dbUrl);

async function run() {
  try {
    console.log("Adding commission configuration columns to affiliates...");
    
    // Check if columns already exist
    const cols = await sql.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'affiliates'`);
    const colNames = cols.rows.map(c => c.column_name);

    if (!colNames.includes('commission_type')) {
      await sql.query(`ALTER TABLE affiliates ADD COLUMN commission_type VARCHAR(50) DEFAULT 'fixed'`);
      console.log("Added commission_type column.");
    } else {
      console.log("commission_type column already exists.");
    }

    if (!colNames.includes('commission_value')) {
      await sql.query(`ALTER TABLE affiliates ADD COLUMN commission_value DECIMAL(10, 2) DEFAULT 0.00`);
      console.log("Added commission_value column.");
    } else {
      console.log("commission_value column already exists.");
    }

    console.log("Migration complete.");
  } catch(e) {
    console.log('Error:', e.message);
  }
}
run();
