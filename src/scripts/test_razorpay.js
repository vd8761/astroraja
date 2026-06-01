import Razorpay from 'razorpay';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const lines = envFile.split('\n');
const key_id = lines.find(l => l.startsWith('RAZORPAY_KEY_ID=')).split('=')[1].trim();
const key_secret = lines.find(l => l.startsWith('RAZORPAY_KEY_SECRET=')).split('=')[1].trim();

console.log('Testing Razorpay keys:');
console.log('Key ID:', key_id);
console.log('Key Secret:', key_secret.substring(0, 4) + '...');

const razorpay = new Razorpay({ key_id, key_secret });

async function run() {
  try {
    const options = {
      amount: 99 * 100,
      currency: 'INR',
      receipt: `rcpt_test_${Date.now()}`
    };
    console.log('Creating order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Razorpay Order created successfully:', order);
  } catch (error) {
    console.error('Razorpay Error details:', error);
  }
}

run();
