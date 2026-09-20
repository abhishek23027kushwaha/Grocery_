'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Check, Package } from 'lucide-react'
import { Shell, useCart } from '@/components/storefront-shell'

export default function OrdersPage() {
  const { cart, update } = useCart()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  
  useEffect(() => {
    const fetchOrders = async (userId: string) => {
      try {
        const res = await fetch(`/api/orders?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
        }
      } catch (e) {
        console.error('Failed to fetch orders')
      } finally {
        setIsLoadingOrders(false)
      }
    }

    const userStr = localStorage.getItem('user')
    if (userStr) {
      const u = JSON.parse(userStr)
      setUser(u)
      if (u.id) fetchOrders(u.id)
      else setIsLoadingOrders(false)
    } else {
      router.push('/login')
    }
  }, [router])

  if (!user) return <Shell cart={cart} update={update}><section className="mx-auto w-full px-5 py-10 lg:px-8">Loading...</section></Shell>

  return (
    <Shell cart={cart} update={update}>
      <section className="mx-auto w-full max-w-4xl px-5 py-10 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#789080]">Your grovli</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.05em]">My Orders</h1>
        <p className="mt-3 text-[#789080] mb-8">View all your past and current orders.</p>
        
        <div className="mt-4">
          {isLoadingOrders ? (
            <p className="text-[#789080]">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-[#e9eee7] bg-white p-8 text-center flex flex-col items-center">
              <p className="text-[#789080] mb-5">You haven't placed any orders yet.</p>
              <Link href="/" className="inline-flex items-center justify-center rounded-xl bg-[#639443] px-6 py-3 text-sm font-extrabold text-white hover:bg-[#4f823d] transition-colors">
                Continue to Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <div key={order._id} className="rounded-2xl border border-[#e9eee7] bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-[#e9f4d9] text-[#4f823d] shrink-0">
                        <Package size={19} />
                      </span>
                      <div>
                        <h3 className="font-extrabold">Order #{order._id.slice(-6).toUpperCase()}</h3>
                        <p className="text-sm text-[#789080]">
                          {order.items?.length || 0} items · ₹{order.totalAmount} · {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 rounded-xl border border-[#e9eee7] p-3">
                          <div className="size-16 shrink-0 rounded-lg bg-[#f3f7f0] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image || "https://images.unsplash.com/photo-1603894584373-5ac82bea6783?q=80&w=400&auto=format&fit=crop"} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#17271d] line-clamp-1">{item.name}</h4>
                            <p className="text-xs text-[#789080] mt-0.5">Qty: {item.quantity}</p>
                            <p className="text-sm font-bold text-[#17271d] mt-0.5">₹{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t border-[#e9eee7] flex items-center justify-between gap-2 text-sm font-bold capitalize text-[#4f823d]">
                    <span className="flex items-center gap-2"><Check size={16} /> Status: {order.status}</span>
                    <div className="flex items-center gap-4">
                      <Link href={`/track-order?id=${order._id}`} className="text-sm font-extrabold text-[#639443] hover:underline">
                        Track order
                      </Link>
                      <span className="text-[#17271d]">Total: ₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Shell>
  )
}
