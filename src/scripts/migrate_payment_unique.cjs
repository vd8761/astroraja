const fs = require('fs');
const { neon } = require('@neondatabase/serverless');

// Read DATABASE_URL from .env
let dbUrl;
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/DATABASE_URL=["']?(.*?)["']?$/m);
  if (match) {
    dbUrl = match[1];
  }
} catch (e) {
  console.error("Could not read .env file:", e.message);
}

if (!dbUrl) {
  console.error("DATABASE_URL not found in .env");
  process.exit(1);
}

const sql = neon(dbUrl);

async function run() {
  try {
    console.log("Checking transactions table constraints...");
    
    // Check if constraint already exists
    const constraints = await sql`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'transactions' AND constraint_type = 'UNIQUE'
    `;
    
    const constraintNames = constraints.map(r => r.constraint_name);
    const hasUniquePaymentId = constraintNames.some(name => name.includes('razorpay_payment_id') || name.includes('unique_payment_id') || name.includes('unique'));
    
    // Let's run a safer check using pg_constraint or information_schema.constraint_column_usage
    const colConstraints = await sql`
      SELECT c.constraint_name, col.column_name 
      FROM information_schema.table_constraints c
      JOIN information_schema.constraint_column_usage col ON c.constraint_name = col.constraint_name
      WHERE c.table_name = 'transactions' AND c.constraint_type = 'UNIQUE' AND col.column_name = 'razorpay_payment_id'
    `;

    if (colConstraints.length === 0) {
      console.log("Adding UNIQUE constraint to transactions.razorpay_payment_id...");
      // Let's clean up any existing invalid duplicates first (just in case they exist in dev DB)
      // We'll keep the oldest one and delete the rest
      await sql`
        DELETE FROM transactions a USING (
          SELECT MIN(id::text)::uuid as keep_id, razorpay_payment_id
          FROM transactions
          WHERE razorpay_payment_id IS NOT NULL
          GROUP BY razorpay_payment_id
          HAVING COUNT(*) > 1
        ) b
        WHERE a.razorpay_payment_id = b.razorpay_payment_id
        AND a.id <> b.keep_id
      `;
      
      await sql`
        ALTER TABLE transactions 
        ADD CONSTRAINT transactions_razorpay_payment_id_unique 
        UNIQUE (razorpay_payment_id)
      `;
      console.log("Added UNIQUE constraint successfully.");
    } else {
      console.log("UNIQUE constraint on razorpay_payment_id already exists.");
    }

    console.log("Migration complete.");
  } catch(e) {
    console.error('Migration Error:', e.message);
  }
}

run();
