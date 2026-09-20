import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/lib/models/Order';
import mongoose from 'mongoose';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const orderId = resolvedParams.id;
    const { deliveryBoyId } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    await connectToDatabase();

    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        $set: { 
          assignedTo: deliveryBoyId,
          status: 'assigned' 
        } 
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name phone vehicleType');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const io = (global as any).io;
    if (io) {
      io.emit('order-updated', order);
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('[PUT /api/orders/[id]/assign] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
