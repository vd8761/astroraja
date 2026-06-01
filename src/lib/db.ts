import { neon } from '@neondatabase/serverless';
import dns from 'node:dns';

// Fix local Node.js IPv6 resolution timeout issues (28-second fetch failed error)
dns.setDefaultResultOrder('ipv4first');


const sql = neon(import.meta.env.DATABASE_URL || process.env.DATABASE_URL!);

export default sql;
