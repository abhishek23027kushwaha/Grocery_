'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, ChevronRight, MapPin, Navigation, Package, Truck, UserRound } from 'lucide-react'
import { AdminShell, StatusBadge } from '@/components/admin-shell'
import { money } from '@/lib/store-data'
import { socket } from '@/lib/socket'
import dynamic from 'next/dynamic'

const DeliveryMap = dynamic(
  () => import('@/components/delivery-map').then((module) => module.DeliveryMap),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-zinc-100 rounded-3xl" /> }
)

export default function AdminOrderDetail() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [nearbyBoys, setNearbyBoys] = useState<any[]>([])
  const [fetchingBoys, setFetchingBoys] = useState(false)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [liveRiderLocation, setLiveRiderLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    const fetchOrder = async (showLoading = true) => {
      try {
        if (showLoading && !order) setLoading(true)
        const res = await fetch(`/api/orders/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (showLoading) setLoading(false)
      }
    }
    
    fetchOrder() // initial fetch
    
    if (!socket.connected) {
      socket.connect()
    }
    
    const handleUpdate = () => fetchOrder(false)
    socket.on('order-updated', handleUpdate)

    const handleLocationUpdate = (data: { deliveryBoyId: string; location: [number, number] }) => {
      // We only care if it's the currently assigned delivery boy
      setOrder(currentOrder => {
        if (currentOrder?.assignedTo?._id === data.deliveryBoyId) {
          setLiveRiderLocation(data.location)
        }
        return currentOrder
      })
    }
    socket.on('admin-location-update', handleLocationUpdate)
    
    return () => {
      socket.off('order-updated', handleUpdate)
      socket.off('admin-location-update', handleLocationUpdate)
    }
  }, [params.id])

  const handleFetchNearbyBoys = async () => {
    setFetchingBoys(true)
    try {
      const res = await fetch('/api/admin/delivery-boys')
      if (res.ok) {
        setNearbyBoys(await res.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFetchingBoys(false)
    }
  }

  const handleAssign = async (boyId: string) => {
    setAssigningId(boyId)
    try {
      const res = await fetch(`/api/orders/${order._id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryBoyId: boyId })
      })
      if (res.ok) {
        const updatedOrder = await res.json()
        setOrder(updatedOrder)
        setNearbyBoys([]) // hide list after assignment
        alert('Delivery boy assigned successfully!')
      } else {
        alert('Failed to assign delivery boy')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setAssigningId(null)
    }
  }

  const markShipped = async () => {
    try {
      // For demo purposes, we will just update state locally
      // In a real app, we would PUT /api/orders/[id] with status: 'shipped'
      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'shipped' })
      })
      if (res.ok) {
        setOrder({ ...order, status: 'shipped' })
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return <AdminShell title="Loading Order..." description="Please wait"><div className="animate-pulse h-64 bg-zinc-200 rounded-3xl" /></AdminShell>
  }

  if (!order) {
    return <AdminShell title="Order not found" description="The requested order does not exist."><Link href="/admin" className="text-emerald-600 underline">Go back</Link></AdminShell>
  }

  return (
    <AdminShell 
      title={`Order #${order._id.slice(-6).toUpperCase()}`} 
      description={`Placed on ${new Date(order.createdAt).toLocaleDateString()}`}
      action={
        <Link href="/admin/orders" className="flex items-center gap-2 rounded-xl border border-[#e5ebe3] bg-white px-4 py-2.5 text-sm font-bold text-[#1c4a31] shadow-sm hover:bg-zinc-50 transition-colors">
          <ArrowLeft size={16} /> Back to orders
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          <section className="rounded-3xl border border-[#e5ebe3] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2"><Package size={20} className="text-emerald-600" /> Items</h2>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex flex-col gap-4">
              {order.items?.map((item: any) => (
                <div key={item._id} className="flex items-center gap-4 border-b border-zinc-100 pb-4 last:border-0 last:pb-0">
                  <img src={item.image} alt={item.name} className="size-16 rounded-xl object-cover border border-zinc-100 bg-zinc-50 mix-blend-multiply" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-zinc-900">{item.name}</h3>
                    <p className="text-xs font-medium text-zinc-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-black text-zinc-900">{money(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-zinc-100 pt-4 flex justify-between items-center">
              <span className="font-bold text-zinc-500">Total Amount</span>
              <span className="text-2xl font-black text-emerald-600">{money(order.totalAmount)}</span>
            </div>
          </section>

          {/* Assignment Section */}
          <section className="rounded-3xl border border-[#e5ebe3] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2 mb-4"><Truck size={20} className="text-emerald-600" /> Delivery Partner</h2>
            
            {order.assignedTo ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <div className="grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                    {order.assignedTo.name?.substring(0, 2).toUpperCase() || 'DP'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{order.assignedTo.name}</p>
                    <p className="text-xs font-medium text-emerald-600">
                      {order.status === 'delivered' ? 'Delivered by' : 'Assigned'} • {order.assignedTo.phone}
                    </p>
                  </div>
                  <div className="ml-auto text-xs font-bold text-zinc-500 uppercase">
                    {order.assignedTo.vehicleType || 'BIKE'}
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-zinc-200 mt-2">
                  <DeliveryMap 
                    status={order.status} 
                    storeCoord={[12.9352, 77.6245]} 
                    customerCoord={
                      order?.user?.currentLocation?.latitude && order?.user?.currentLocation?.longitude
                        ? [order.user.currentLocation.latitude, order.user.currentLocation.longitude]
                        : [12.9716 + (parseInt(order._id.substring(0, 4), 16) % 100) * 0.0005, 77.5946 + (parseInt(order._id.substring(4, 8), 16) % 100) * 0.0005]
                    }
                    riderCoord={liveRiderLocation}
                  />
                </div>
              </div>
            ) : order.status === 'shipped' ? (
              <div>
                <p className="text-sm text-zinc-500 mb-4">This order is ready to be delivered. Assign it to a nearby delivery partner.</p>
                {nearbyBoys.length === 0 ? (
                  <button 
                    onClick={handleFetchNearbyBoys} 
                    disabled={fetchingBoys}
                    className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-zinc-800 disabled:opacity-70 transition-all"
                  >
                    {fetchingBoys ? 'Searching nearby...' : 'Find Nearby Delivery Boys'}
                    {!fetchingBoys && <Navigation size={16} />}
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Available partners within 20km</p>
                    {nearbyBoys.map(boy => (
                      <div key={boy._id} className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 p-3 hover:border-emerald-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="grid size-10 place-items-center rounded-full bg-white shadow-sm font-bold text-zinc-700">
                            {boy.name?.substring(0, 2).toUpperCase() || 'DB'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900">{boy.name}</p>
                            <p className="text-xs text-zinc-500">{boy.distance.toFixed(1)} km away • {boy.vehicleType}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAssign(boy._id)} 
                          disabled={assigningId === boy._id}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {assigningId === boy._id ? 'Assigning...' : 'Assign'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-zinc-100 text-zinc-400">
                  <Check size={20} />
                </div>
                <p className="text-sm font-bold text-zinc-900">Not ready for delivery</p>
                <p className="text-xs text-zinc-500 mt-1 mb-4">Mark the order as shipped to assign a delivery partner.</p>
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <button onClick={markShipped} className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold hover:bg-zinc-50">
                    Mark as Shipped
                  </button>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Customer Sidebar */}
        <div className="flex flex-col gap-6">
          <section className="rounded-3xl border border-[#e5ebe3] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2 mb-4"><UserRound size={20} className="text-emerald-600" /> Customer</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="grid size-10 place-items-center rounded-full bg-[#eff7e6] text-[#639443] font-bold">
                {order.user?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">{order.user?.name || 'Guest'}</p>
                <p className="text-xs text-zinc-500">{order.user?.email}</p>
              </div>
            </div>
            
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mt-6 mb-2">Shipping Address</h3>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-700 leading-relaxed">
                {order.shippingAddress?.street}, <br/>
                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
              </p>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  )
}
