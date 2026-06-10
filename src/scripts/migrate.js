import { neon } from '@neondatabase/serverless';
import dns from 'node:dns';

// Fix local Node.js IPv6 resolution timeout issues
dns.setDefaultResultOrder('ipv4first');

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Creating tables...");

  // Users
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mobile_number VARCHAR(20) UNIQUE,
      email VARCHAR(255),
      token_balance INTEGER DEFAULT 100,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("- users table created");

  // Profiles
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      raasi VARCHAR(100),
      lagnam VARCHAR(100),
      nakshatra VARCHAR(100),
      relationship VARCHAR(50) DEFAULT 'Self',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("- profiles table created");

  // Reports
  await sql`
    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      language VARCHAR(50) DEFAULT 'English',
      form_data JSONB,
      status VARCHAR(50) DEFAULT 'queued',
      raw_markdown_report TEXT,
      price_paid DECIMAL(10,2),
      currency VARCHAR(10),
      tokens_used INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("- reports table created");

  // Transactions
  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      transaction_type VARCHAR(50),
      amount DECIMAL(10,2),
      currency VARCHAR(10),
      razorpay_order_id VARCHAR(100),
      razorpay_payment_id VARCHAR(100),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("- transactions table created");

  // Feedbacks
  await sql`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("- feedbacks table created");

  // Archived Users
  await sql`
    CREATE TABLE IF NOT EXISTS archived_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      email VARCHAR(255),
      mobile_number VARCHAR(20),
      user_data JSONB NOT NULL,
      deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("- archived_users table created");

  console.log("All tables created successfully!");
}

main().catch(console.error);
