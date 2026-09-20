'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { StatusBadge } from './admin-shell'

export function MyOrdersClient() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [nearbyBoys, setNearbyBoys] = useState<Record<string, any[]>>({})
  const [fetchingBoys, setFetchingBoys] = useState<Record<string, boolean>>({})
  const [assigningId, setAssigningId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async (userId: string) => {
      try {
        const url = userId ? `/api/orders?userId=${userId}` : `/api/orders`
        const res = await fetch(url)
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
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const u = JSON.parse(userStr)
      setUser(u)
      if (u.role === 'ADMIN' || u.role === 'admin') {
        fetchOrders('')
      } else if (u.id || u._id) {
        fetchOrders(u.id || u._id)
      } else {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
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

  const fetchNearbyBoysForOrder = async (orderId: string) => {
    setFetchingBoys(prev => ({ ...prev, [orderId]: true }))
    try {
      const res = await fetch(`/api/admin/delivery-boys?orderId=${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setNearbyBoys(prev => ({ ...prev, [orderId]: data }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setFetchingBoys(prev => ({ ...prev, [orderId]: false }))
    }
  }

  const assignBoyToOrder = async (orderId: string, boyId: string) => {
    setAssigningId(boyId)
    try {
      const res = await fetch(`/api/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryBoyId: boyId })
      })
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'assigned' } : o))
        setNearbyBoys(prev => { const next = {...prev}; delete next[orderId]; return next; })
        alert('Assigned successfully!')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAssigningId(null)
    }
  }

  if (isLoading) {
    return <p className="text-[#789080]">Loading orders...</p>
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e9eee7] bg-white p-8 text-center max-w-4xl flex flex-col items-center">
        <p className="text-[#789080] mb-5">You haven't placed any orders yet.</p>
        <Link href="/" className="inline-flex items-center justify-center rounded-xl bg-[#639443] px-6 py-3 text-sm font-extrabold text-white hover:bg-[#4f823d] transition-colors">
          Continue to Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {orders.map((order, i) => (
        <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-[#e5ebe3] p-6 flex flex-col gap-6">
          <div className="flex justify-between items-start border-b border-[#edf1eb] pb-4">
            <div>
              <h2 className="font-extrabold text-lg">#{order._id.slice(-6).toUpperCase()}</h2>
              <p className="text-sm text-[#789080]">Placed {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={order.status} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-1 text-sm text-[#17271d]">
                <h3 className="font-bold text-base">{order.user?.name || user?.name || 'Customer'}</h3>
                <p className="text-[#789080]">{order.user?.email || user?.email || 'N/A'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#789080]">📞</span>
                  <span>{user?.phone || 'N/A'}</span>
                </div>
                <p className="mt-1 font-semibold">Payment Method: {order.paymentMethod?.toUpperCase()}</p>
              </div>

              {order.shippingAddress && (
                <div className="flex flex-col gap-1 text-sm text-[#17271d]">
                  <p>- {order.shippingAddress.street}, {order.shippingAddress.city}</p>
                  <p className="text-xs text-[#789080]">Postal Code: {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 w-full md:w-60">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="border border-[#e5ebe3] rounded-xl p-3">
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-[#f3f7f0]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1603894584373-5ac82bea6783?q=80&w=400&auto=format&fit=crop"} 
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="font-extrabold text-sm text-[#17271d]">{item.name}</h3>
                  <p className="text-xs text-[#789080] mt-1">Qty: {item.quantity}</p>
                  <p className="text-xs text-[#789080] mt-1">Price: ₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-5 border-t border-[#edf1eb]">
             <div className="flex items-center gap-4">
               {(user?.role === 'ADMIN' || user?.role === 'admin') && (
                 <select
                   value={order.status}
                   onChange={(e) => handleStatusChange(order._id, e.target.value)}
                   className="text-xs border border-[#e5ebe3] rounded-lg px-2 py-1.5 font-semibold bg-[#fafcf9] text-[#17271d] focus:outline-none focus:ring-1 focus:ring-[#639443]"
                 >
                   <option value="pending">Pending</option>
                   <option value="processing">Processing</option>
                   <option value="shipped">Shipped</option>
                   <option value="delivered">Delivered</option>
                   <option value="cancelled">Cancelled</option>
                 </select>
               )}
             </div>
             <div className="text-right">
               <span className="font-extrabold text-lg text-[#17271d]">Total: ₹{order.totalAmount}</span>
             </div>
          </div>

          {/* Delivery Assignment UI for Admin */}
          {user?.role === 'ADMIN' && order.status === 'shipped' && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-emerald-900">Assign Delivery Partner</h3>
                  <p className="text-xs text-emerald-700">Order is shipped and ready for delivery.</p>
                </div>
                {!nearbyBoys[order._id] ? (
                  <button 
                    onClick={() => fetchNearbyBoysForOrder(order._id)}
                    disabled={fetchingBoys[order._id]}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {fetchingBoys[order._id] ? 'Finding...' : 'Find Nearby (20km)'}
                  </button>
                ) : (
                  <button 
                    onClick={() => setNearbyBoys(prev => { const next = {...prev}; delete next[order._id]; return next; })}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
              
              {nearbyBoys[order._id] && nearbyBoys[order._id].length === 0 && (
                <p className="mt-3 text-xs text-rose-600 font-semibold">No available delivery partners within 20km.</p>
              )}

              {nearbyBoys[order._id] && nearbyBoys[order._id].length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {nearbyBoys[order._id].map((boy: any) => (
                    <div key={boy._id} className="flex items-center justify-between rounded-lg border border-emerald-200/50 bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="grid size-8 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-700 text-xs">
                          {boy.name?.substring(0, 2).toUpperCase() || 'DB'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{boy.name}</p>
                          <p className="text-xs text-zinc-500">{boy.distance.toFixed(1)} km away</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => assignBoyToOrder(order._id, boy._id)}
                        disabled={assigningId === boy._id}
                        className="rounded-md bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
                      >
                        {assigningId === boy._id ? '...' : 'Assign'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
