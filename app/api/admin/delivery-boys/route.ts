import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

// Haversine distance formula in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

import Order from '@/lib/models/Order'; // Added Order model

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    let storeLat = parseFloat(searchParams.get('lat') || '12.9352');
    let storeLng = parseFloat(searchParams.get('lng') || '77.6245');

    await connectToDatabase();
    
    // If orderId is provided, calculate distance from the customer's exact location
    if (orderId) {
      const order = await Order.findById(orderId).lean();
      if (order && order.shippingAddress) {
        if (order.shippingAddress.lat && order.shippingAddress.lng) {
          storeLat = order.shippingAddress.lat;
          storeLng = order.shippingAddress.lng;
        } else {
          // Fallback geocoding for legacy orders
          try {
             const query = encodeURIComponent(`${order.shippingAddress.street || ''} ${order.shippingAddress.city || ''}`);
             const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
               headers: { 'User-Agent': 'GrovliDeliveryApp/1.0' }
             });
             if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                   storeLat = parseFloat(data[0].lat);
                   storeLng = parseFloat(data[0].lon);
                }
             }
          } catch(e) {
            console.error("Geocoding failed for legacy order", e);
          }
        }
      }
    }
    
    // Find all active delivery boys
    const deliveryBoys = await User.find({ role: 'DELIVERY_BOY' }).lean();
    
    // Add fake coordinates if they don't have one for demo purposes
    // And calculate distance
    const nearbyBoys = deliveryBoys.map((boy: any) => {
      let lat = boy.currentLocation?.latitude;
      let lng = boy.currentLocation?.longitude;
      
      if (!lat || !lng) {
        // Generate random coordinates near the CUSTOMER (approx within 25km) for demo
        lat = storeLat + (Math.random() - 0.5) * 0.25;
        lng = storeLng + (Math.random() - 0.5) * 0.25;
      }
      
      const distance = getDistance(storeLat, storeLng, lat, lng);
      return { ...boy, distance, currentLocation: { latitude: lat, longitude: lng } };
    })
    .filter((boy: any) => boy.distance <= 20) // Strictly 20km
    .sort((a: any, b: any) => a.distance - b.distance);

    return NextResponse.json(nearbyBoys);
  } catch (error: any) {
    console.error('[GET /api/admin/delivery-boys] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
