import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    // Reference User model to prevent tree-shaking
    if (!User) throw new Error("User model missing");
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const assignedTo = searchParams.get('assignedTo');
    const status = searchParams.get('status');
    
    const filter: any = {};
    if (userId) filter.user = userId;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (status) {
      if (status.includes(',')) {
        filter.status = { $in: status.split(',') };
      } else {
        filter.status = status;
      }
    }
    
    const orders = await Order.find(filter)
      .populate('user', 'name email currentLocation')
      .populate('assignedTo', 'name phone vehicleType currentLocation')
      .sort({ createdAt: -1, _id: -1 });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    // Geocode the shipping address if lat/lng are not provided
    if (body.shippingAddress && (!body.shippingAddress.lat || !body.shippingAddress.lng)) {
      try {
        const { street, city } = body.shippingAddress;
        // Use a generic query string prioritizing street and city
        const query = encodeURIComponent(`${street || ''} ${city || ''}`);
        // Add User-Agent as required by Nominatim
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
          headers: {
            'User-Agent': 'GrovliDeliveryApp/1.0'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            body.shippingAddress.lat = parseFloat(data[0].lat);
            body.shippingAddress.lng = parseFloat(data[0].lon); // nominatim returns lon
          }
        }
      } catch (err) {
        console.error("Geocoding failed during order creation:", err);
      }
    }

    const order = await Order.create(body);
    const io = (global as any).io;
    if (io) {
      io.emit('new-order', order);
    }
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
