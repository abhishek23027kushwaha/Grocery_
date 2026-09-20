'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, MoreHorizontal, Package } from 'lucide-react'
import { AdminShell, StatusBadge } from '@/components/admin-shell'
import { money } from '@/lib/store-data'
import { socket } from '@/lib/socket'

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true)
        const res = await fetch('/api/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (showLoading) setLoading(false)
      }
    }
    
    fetchOrders() // initial fetch
    
    if (!socket.connected) {
      socket.connect()
    }
    
    const handleUpdate = () => fetchOrders(false)
    socket.on('new-order', handleUpdate)
    socket.on('order-updated', handleUpdate)
    
    return () => {
      socket.off('new-order', handleUpdate)
      socket.off('order-updated', handleUpdate)
    }
  }, [])

  return (
    <AdminShell title="Orders" description="Manage and track all customer orders.">
      <section className="overflow-hidden rounded-2xl border border-[#e5ebe3] bg-white">
        <div className="flex items-center justify-between border-b border-[#edf1eb] p-5 md:p-6">
          <div>
            <h2 className="font-extrabold flex items-center gap-2"><Package size={18} className="text-emerald-600" /> All Orders</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[#fafcf9] text-xs text-[#789080]">
              <tr>
                <th className="px-6 py-3 font-semibold">Order ID</th>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Total</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#789080]">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#789080]">No orders found</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="border-t border-[#edf1eb] hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900">
                      <Link href={`/admin/orders/${order._id}`} className="hover:text-emerald-600 hover:underline">
                        #{order._id.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {order.user?.name || 'Guest'}
                      <span className="block text-xs font-normal text-[#789080]">{order.user?.email}</span>
                    </td>
                    <td className="px-6 py-4 font-bold">{money(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${order._id}`} className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-bold hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                        View <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  )
}
