import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/lib/models/Product';

export async function GET() {
  try {
    await connectToDatabase();
    const stats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgPrice: { $avg: '$price' },
        },
      },
      { $sort: { count: -1 } },
    ]);
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}