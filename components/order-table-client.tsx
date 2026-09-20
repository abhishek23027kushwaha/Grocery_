'use client'

import { useEffect, useState } from 'react'
import { StatusBadge } from './admin-shell'

export function OrderTableClient() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders`)
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
        }
      } catch (e) {
        console.error('Failed to fetch orders')
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
      }
    } catch (e) {
      console.error('Failed to update status')
    }
  }

  if (isLoading) return <p className="text-[#789080] p-5">Loading orders...</p>

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e5ebe3] bg-white">
      <div className="border-b border-[#edf1eb] p-5">
        <h2 className="font-extrabold">All orders</h2>
        <p className="mt-1 text-xs text-[#789080]">{orders.length} orders placed</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-[#fafcf9] text-xs text-[#789080]">
            <tr>
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t border-[#edf1eb]">
                <td className="px-6 py-4 font-bold">#{order._id.slice(-6).toUpperCase()}</td>
                <td className="px-6 py-4">
                  {order.user?.name || 'Guest'}
                  <span className="block text-xs text-[#789080]">{order.user?.email || 'N/A'}</span>
                </td>
                <td className="px-6 py-4 text-[#789080]">{order.items?.length || 0} items</td>
                <td className="px-6 py-4 font-bold">₹{order.totalAmount}</td>
                <td className="px-6 py-4 flex items-center gap-2">
                  <StatusBadge status={order.status}/>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="text-xs border border-[#e5ebe3] rounded-lg px-2 py-1 font-semibold bg-[#fafcf9] text-[#17271d] focus:outline-none focus:ring-1 focus:ring-[#639443]"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[#789080]">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
