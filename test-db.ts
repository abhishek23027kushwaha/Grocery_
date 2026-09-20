import mongoose from 'mongoose';
import connectToDatabase from './lib/db.ts';
import Order from './lib/models/Order.ts';
import User from './lib/models/User.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  try {
    console.log('Connecting...');
    await connectToDatabase();
    console.log('Connected');
    
    const count = await User.countDocuments();
    console.log('Users:', count);

    const orders = await Order.countDocuments();
    console.log('Orders:', orders);
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
test();
