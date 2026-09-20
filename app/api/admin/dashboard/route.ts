import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 1. Orders and Revenue Today
    const todayOrders = await Order.find({
      createdAt: { $gte: startOfToday },
    });

    const ordersToday = todayOrders.length;
    const revenueToday = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // 2. Active Customers (Users with role USER)
    const activeCustomers = await User.countDocuments({ role: 'USER' });

    // 3. Avg Order Value
    const allOrders = await Order.find();
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrderValue = allOrders.length > 0 ? Math.round(totalRevenue / allOrders.length) : 0;

    // 4. Order Status (Live fulfilment queue)
    const preparing = await Order.countDocuments({ status: { $in: ['pending', 'processing'] } });
    const outForDelivery = await Order.countDocuments({ status: 'out_for_delivery' });
    const delivered = await Order.countDocuments({ status: 'delivered' });

    // 5. Revenue Overview (Last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayOrders = await Order.find({
        createdAt: { $gte: d, $lt: nextDay },
      });
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      last7Days.push({
        day: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
        revenue: dayRevenue
      });
    }

    // Normalize revenue heights for the chart (0-100%)
    const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 1);
    const revenueOverview = last7Days.map((d, index) => ({
      day: d.day,
      height: Math.round((d.revenue / maxRevenue) * 100),
      isToday: index === 6
    }));

    // Construct response
    const dashboardData = {
      stats: [
        { label: "Today's revenue", value: `₹${revenueToday.toLocaleString('en-IN')}`, change: "+0%", icon: "IndianRupee" },
        { label: "Orders today", value: ordersToday.toString(), change: "+0%", icon: "ShoppingBag" },
        { label: "Active customers", value: activeCustomers.toLocaleString('en-IN'), change: "+0%", icon: "Users" },
        { label: "Avg. order value", value: `₹${avgOrderValue.toLocaleString('en-IN')}`, change: "+0%", icon: "ChartNoAxesCombined" },
      ],
      revenueOverview,
      orderStatus: [
        { label: 'Preparing', value: preparing.toString(), color: 'bg-[#d9f04a]' },
        { label: 'Out for delivery', value: outForDelivery.toString(), color: 'bg-[#98c56b]' },
        { label: 'Delivered', value: delivered.toString(), color: 'bg-[#dbead4]' },
      ]
    };

    return NextResponse.json(dashboardData);
  } catch (error: any) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data', details: error?.message || String(error) }, { status: 500 });
  }
}
