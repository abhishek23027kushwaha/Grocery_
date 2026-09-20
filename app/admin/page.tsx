'use client'
import Link from 'next/link'
import { ArrowUpRight, ChartNoAxesCombined, IndianRupee, MoreHorizontal, Package, ShoppingBag, Users } from 'lucide-react'
import { AdminButton, AdminShell, StatusBadge } from '@/components/admin-shell'
import { useEffect, useState } from 'react'
import { socket } from '@/lib/socket'

const statIcons = { IndianRupee, ShoppingBag, Users, ChartNoAxesCombined }

export default function AdminOverview() { 
  const [orders, setOrders] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [ordersRes, dashRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/admin/dashboard')
        ]);
        
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data.slice(0, 5));
        }
        
        if (dashRes.ok) {
          const data = await dashRes.json();
          setDashboard(data);
        }
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();

    // Listen for real-time order updates
    socket.connect();
    socket.on('new-order', fetchDashboard);
    socket.on('order-status-updated', fetchDashboard); // Also update on status changes

    return () => {
      socket.off('new-order', fetchDashboard);
      socket.off('order-status-updated', fetchDashboard);
      socket.disconnect();
    };
  }, []);

  return <AdminShell title="Good morning, admin" description="Here’s what’s happening with your store today." action={<AdminButton href="/admin/products">Add product</AdminButton>}>
    
    {loading ? (
       <div className="flex justify-center py-20 text-[#789080]">Loading dashboard...</div>
    ) : (
      <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboard?.stats?.map((stat: any) => { 
            const Icon = statIcons[stat.icon as keyof typeof statIcons] || Package; 
            return (
              <div key={stat.label} className="rounded-2xl border border-[#e5ebe3] bg-white p-5">
                <div className="flex items-start justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#eff7e6] text-[#639443]">
                    <Icon size={19}/>
                  </span>
                  <span className="text-xs font-bold text-[#5d9b52]">{stat.change}</span>
                </div>
                <p className="mt-5 text-sm text-[#789080]">{stat.label}</p>
                <p className="mt-1 text-2xl font-extrabold tracking-[-.04em]">{stat.value}</p>
              </div> 
            ) 
          })}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-[#e5ebe3] bg-white p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold">Revenue overview</h2>
                <p className="mt-1 text-xs text-[#789080]">Last 7 days · All channels</p>
              </div>
              <button className="rounded-lg border border-[#e5ebe3] px-3 py-2 text-xs font-bold">This week</button>
            </div>
            <div className="mt-8 flex h-52 items-end gap-3 border-b border-l border-[#edf1eb] px-3 pb-0 pt-5 sm:gap-6">
              {dashboard?.revenueOverview?.map((data: any, index: number) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div 
                    className={`w-full max-w-10 rounded-t-lg ${data.isToday ? 'bg-[#d9f04a]' : 'bg-[#cfe6bb]'}`} 
                    style={{ height: `${data.height}%` }}
                    title={`₹${data.revenue}`}
                  />
                  <span className="text-[10px] text-[#94a399]">{data.day}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#e5ebe3] bg-white p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold">Order status</h2>
                <p className="mt-1 text-xs text-[#789080]">Live fulfilment queue</p>
              </div>
              <Link href="/admin/orders" className="text-xs font-bold text-[#639443]">View all <ArrowUpRight className="inline" size={14}/></Link>
            </div>
            <div className="mt-7 flex flex-col gap-5">
              {dashboard?.orderStatus?.map((status: any) => (
                <div key={status.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{status.label}</span>
                    <b>{status.value}</b>
                  </div>
                  <div className="h-2 rounded-full bg-[#eef2eb]">
                    <div className={`h-full rounded-full ${status.color}`} style={{width: `${Math.min(100, Number(status.value)*2)}%`}}/>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#e5ebe3] bg-white">
          <div className="flex items-center justify-between border-b border-[#edf1eb] p-5 md:p-6">
            <div>
              <h2 className="font-extrabold">Recent orders</h2>
              <p className="mt-1 text-xs text-[#789080]">Latest activity from your customers</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-bold text-[#639443]">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-[#fafcf9] text-xs text-[#789080]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Order</th>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Items</th>
                  <th className="px-6 py-3 font-semibold">Total</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3"/>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#789080]">No orders found</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-t border-[#edf1eb]">
                      <td className="px-6 py-4 font-bold">#{order._id.slice(-6).toUpperCase()}</td>
                      <td className="px-6 py-4">
                        {order.user?.name || 'Guest'}
                        <span className="block text-xs font-normal text-[#789080]">{order.user?.email}</span>
                      </td>
                      <td className="px-6 py-4 text-[#789080]">{order.items?.length || 0} items</td>
                      <td className="px-6 py-4 font-bold">₹{order.totalAmount}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status}/>
                      </td>
                      <td className="px-6 py-4">
                        <button aria-label="More order actions">
                          <MoreHorizontal size={18} className="text-[#789080]"/>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </>
    )}
  </AdminShell> 
}
