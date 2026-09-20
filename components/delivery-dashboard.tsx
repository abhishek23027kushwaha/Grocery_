'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowLeft, Bell, Bike, Check, ChevronRight, MapPin, Phone, ShieldCheck, UserRound, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { deliveryOrder, deliveryStats, deliverySteps } from '@/lib/delivery-data'
import { socket } from '@/lib/socket'

const DeliveryMap = dynamic(
  () => import('@/components/delivery-map').then((module) => module.DeliveryMap),
  { ssr: false, loading: () => <div className="h-[440px] w-full animate-pulse bg-zinc-100 rounded-3xl flex items-center justify-center">Loading map...</div> }
)

export function DeliveryDashboard({ customerView = false }: { customerView?: boolean }) {
  const [status, setStatus] = useState<string>('Assigned')
  const [assignmentStatus, setAssignmentStatus] = useState<'pending' | 'accepted' | 'completed' | 'rejected'>('completed')
  const [user, setUser] = useState<any>(null)
  const [order, setOrder] = useState<any>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', vehicleType: 'BIKE' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null)
  const [city, setCity] = useState('Fetching Location...')
  const [isLocating, setIsLocating] = useState(true)
  const [geocodedCustomerCoord, setGeocodedCustomerCoord] = useState<[number, number] | null>(null)

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!customerView && navigator.geolocation && userId) {
      const watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const loc = [lat, lng] as [number, number];
          setCurrentLocation(loc);
          if (order?._id) {
            socket.emit('location-update', { 
              orderId: order._id,
              lat: loc[0], 
              lng: loc[1] 
            });
          }
          
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (response.ok) {
              const data = await response.json();
              const cityName = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Current Location";
              setCity(cityName);
            }
          } catch (error) {
            console.error("Error fetching city:", error);
          } finally {
            setIsLocating(false);
          }
        },
        (err) => {
          console.log(err);
          setCity('Location unavailable');
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
      
      const heartbeatInterval = setInterval(() => {
         setCurrentLocation((prevLoc) => {
           if (prevLoc && order?._id) {
             // 1. Emit via socket (fastest if working)
             socket.emit('location-update', {
               orderId: order._id,
               lat: prevLoc[0],
               lng: prevLoc[1]
             });
             
             // 2. Update DB as a reliable fallback for dev servers
             fetch(`/api/users/${userId}`, {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ 
                 currentLocation: { latitude: prevLoc[0], longitude: prevLoc[1] } 
               })
             }).catch(e => console.error("Heartbeat DB update failed", e));
           }
           return prevLoc;
         });
      }, 3000);

      return () => {
        navigator.geolocation.clearWatch(watchId);
        clearInterval(heartbeatInterval);
      };
    }
  }, [customerView, user, order?._id]);

  useEffect(() => {
    let currentUser: any;
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        currentUser = JSON.parse(userStr)
        setUser(currentUser)
        setFormData({
          name: currentUser.name || '',
          phone: currentUser.phone || '',
          vehicleType: currentUser.vehicleType || 'BIKE'
        })
        fetchOrderData(currentUser) // Initial fetch
        
        if (!socket.connected) {
          socket.connect();
        }
        
        const handleUpdate = () => {
          fetchOrderData(currentUser, false);
        };
        
        const handleLocationUpdate = (data: { orderId: string, lat: number, lng: number }) => {
          if (customerView && data.lat && data.lng) {
            setCurrentLocation([data.lat, data.lng]);
          }
        };

        socket.on('new-order', handleUpdate);
        socket.on('order-updated', handleUpdate);
        socket.on('location-update', handleLocationUpdate);
        
        // Polling fallback for customer view in case sockets fail due to dev server HMR
        let pollInterval: any;
        if (customerView) {
          pollInterval = setInterval(() => {
            fetchOrderData(currentUser, false);
          }, 5000);
        }
        
        return () => {
          socket.off('new-order');
          socket.off('order-updated');
          socket.off('location-update');
          if (pollInterval) clearInterval(pollInterval);
        }
      } else {
        setLoading(false)
      }
    } catch (e) {
      setLoading(false)
    }
  }, [customerView])

  const fetchOrderData = async (currentUser: any, showLoading = true) => {
    const currentId = currentUser?._id || currentUser?.id;
    if (!currentId) {
      setLoading(false);
      return;
    }
    try {
      if (showLoading) setLoading(true);
      let url = '';
      if (customerView) {
        url = `/api/orders?userId=${currentId}&status=assigned,picked_up,out_for_delivery,delivered`;
      } else {
        url = `/api/orders?assignedTo=${currentId}&status=assigned,picked_up,out_for_delivery`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const orders = await res.json();
        if (orders && orders.length > 0) {
          const activeOrder = orders[0];
          setOrder(activeOrder);
          
          if (customerView && activeOrder?.assignedTo?.currentLocation?.latitude) {
            setCurrentLocation([activeOrder.assignedTo.currentLocation.latitude, activeOrder.assignedTo.currentLocation.longitude]);
          }

          if (activeOrder?._id) {
            socket.emit('join-order', activeOrder._id);
          }
          
          let displayStatus = 'Assigned';
          if (activeOrder.status === 'assigned') displayStatus = 'Assigned';
          if (activeOrder.status === 'picked_up') displayStatus = 'Picked up';
          if (activeOrder.status === 'out_for_delivery') displayStatus = 'On the way';
          if (activeOrder.status === 'delivered') displayStatus = 'Delivered';
          
          setStatus(displayStatus);
          
          if (!customerView) {
            if (activeOrder.status === 'assigned') {
              setAssignmentStatus('pending');
            } else {
              setAssignmentStatus('accepted');
            }
          } else {
            setAssignmentStatus('accepted');
          }

          // Legacy fallback: geocode dynamically if lat/lng is missing
          if (activeOrder?.shippingAddress && (!activeOrder.shippingAddress.lat || !activeOrder.shippingAddress.lng)) {
            try {
              const query = encodeURIComponent(`${activeOrder.shippingAddress.street || ''} ${activeOrder.shippingAddress.city || ''}`);
              fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
                headers: { 'User-Agent': 'GrovliDeliveryApp/1.0' }
              })
              .then(r => r.json())
              .then(data => {
                if (data && data.length > 0) {
                  setGeocodedCustomerCoord([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                }
              })
              .catch(e => console.error("Dynamic geocoding failed", e));
            } catch (e) {}
          }
        } else {
          setOrder(null);
          if (!customerView) setAssignmentStatus('completed');
        }
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (!order?._id) return;
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
        return true;
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
    return false;
  }

  const handleSaveProfile = async () => {
    const userId = user?._id || user?.id;
    if (!userId) {
      alert("User session invalid. Please log in again.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setShowProfileModal(false);
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };
  
  const nextStatus = status === 'Assigned' ? 'Picked up' : 
                     status === 'Picked up' ? 'On the way' : 
                     status === 'On the way' ? 'Delivered' : 'Delivered'
                     
  const handleNextStatus = async () => {
    if (status === 'Delivered') {
      const success = await updateOrderStatus('delivered');
      if (success) {
        setAssignmentStatus('completed');
        setOrder(null);
      }
    } else {
      let backendStatus = 'assigned';
      if (nextStatus === 'Picked up') backendStatus = 'picked_up';
      if (nextStatus === 'On the way') backendStatus = 'out_for_delivery';
      if (nextStatus === 'Delivered') backendStatus = 'delivered';
      
      const success = await updateOrderStatus(backendStatus);
      if (success) {
        setStatus(nextStatus);
      }
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-zinc-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 pb-20 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500 text-white shadow-sm">
              g.
            </span>
            grovli<span className="text-emerald-500">.</span>
          </Link>
          <div className="flex items-center gap-3">
            {!customerView && (
              <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs md:flex border border-emerald-100">
                <MapPin size={14} className={`text-emerald-500 ${isLocating ? 'animate-bounce' : ''}`} />
                <span className="font-bold text-emerald-700 max-w-[120px] truncate">{isLocating ? 'Locating...' : city}</span>
              </div>
            )}
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:inline">
              {customerView ? 'Order tracking' : 'Delivery partner'}
            </span>
            <button className="grid size-10 place-items-center rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 transition">
              <Bell size={18} className="text-zinc-600" />
            </button>
            <div 
              onClick={() => !customerView && setShowProfileModal(true)}
              className={`grid size-10 place-items-center rounded-full bg-zinc-900 text-sm font-bold text-white shadow-sm ${!customerView ? 'cursor-pointer hover:bg-zinc-800' : ''}`}
              title={!customerView ? "Edit Profile" : ""}
            >
              {customerView ? 'AM' : (user?.name?.substring(0, 2).toUpperCase() || 'RK')}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-5xl px-5 py-8">
        {/* Top Greeting */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              {customerView ? 'Live order' : 'Partner app'}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900">
              {customerView ? 'Your order is on the way' : `Good morning, ${user?.name?.split(' ')[0] || 'Rohan'}.`}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {customerView 
                ? 'Your groceries are almost at your doorstep.' 
                : 'You have one active delivery and 4 more to unlock today\'s bonus.'}
            </p>
          </div>
          
          {!customerView && (
            <div className="rounded-2xl bg-zinc-900 px-5 py-3 text-white shadow-md">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Online status</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-bold">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" /> 
                Accepting deliveries
              </p>
            </div>
          )}
        </div>

        {/* Delivery Stats (Partner Only) */}
        {!customerView && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {deliveryStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold text-zinc-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-extrabold text-zinc-900">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold text-emerald-600">{stat.detail}</p>
              </div>
            ))}
          </div>
        )}

        {/* Dashboard Grid */}
        {assignmentStatus === 'pending' && !customerView ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-blue-100 text-blue-600 mb-4">
              <Bell size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-900 mb-2">New Delivery Request</h2>
            <p className="text-zinc-500 mb-8">Order {order?._id?.substring(0, 8)} from {order?.shippingAddress?.street || 'Customer Address'}.</p>
            <div className="flex gap-4">
              <button 
                onClick={async () => {
                  const success = await updateOrderStatus('cancelled'); // Or some rejected state
                  if (success) setAssignmentStatus('rejected');
                }}
                className="flex-1 rounded-2xl bg-zinc-100 py-3.5 font-bold text-zinc-700 hover:bg-zinc-200 transition"
              >
                Reject
              </button>
              <button 
                onClick={async () => {
                  const success = await updateOrderStatus('picked_up');
                  if (success) {
                    setAssignmentStatus('accepted');
                    setStatus('Picked up');
                  }
                }}
                className="flex-1 rounded-2xl bg-emerald-600 py-3.5 font-bold text-white hover:bg-emerald-700 shadow-md transition"
              >
                Accept Order
              </button>
            </div>
          </div>
        ) : assignmentStatus === 'rejected' && !customerView ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm text-center">
            <h2 className="text-xl font-extrabold text-zinc-900 mb-2">Order Rejected</h2>
            <p className="text-zinc-500 mb-6">Waiting for next delivery assignment...</p>
            <button 
              onClick={() => setAssignmentStatus('pending')}
              className="rounded-2xl bg-zinc-100 px-6 py-3 font-bold text-zinc-700 hover:bg-zinc-200 transition"
            >
              Simulate New Order
            </button>
          </div>
        ) : assignmentStatus === 'completed' && !customerView ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <Check size={32} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-900 mb-2">Delivery Successful!</h2>
            <p className="text-zinc-500 mb-8">Great job. Your earnings have been updated.</p>
            <button 
              onClick={() => { setAssignmentStatus('pending'); setStatus('Assigned'); }}
              className="rounded-2xl bg-zinc-100 px-6 py-3 font-bold text-zinc-700 hover:bg-zinc-200 transition"
            >
              Wait for new orders
            </button>
          </div>
        ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
          
          {/* Map Section or Delivered Message */}
          {status === 'Delivered' && customerView ? (
            <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 shadow-sm flex flex-col p-8 text-center justify-center items-center min-h-[400px]">
              <div className="grid size-20 place-items-center rounded-full bg-emerald-200 text-emerald-700 shadow-inner mb-6">
                <Check size={40} strokeWidth={3} />
              </div>
              <h2 className="text-3xl font-extrabold text-zinc-900 mb-2">Order Delivered Successfully</h2>
              <p className="text-zinc-600 mb-8 max-w-sm">Thank you for shopping with Grovli. We hope to see you again soon!</p>
              <Link href="/" className="rounded-2xl bg-emerald-600 px-8 py-3.5 font-bold text-white hover:bg-emerald-700 shadow-md transition">
                Continue Shopping
              </Link>
            </section>
          ) : (
            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm flex flex-col">
              <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    {customerView ? 'Arriving in' : 'Assigned delivery'}
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold text-zinc-900">
                    {status === 'Delivered' ? 'Completed' : '15 mins'}
                  </h2>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {status}
                </span>
              </div>
              
              {/* The Dynamic Map Component */}
              <DeliveryMap 
                status={status} 
                storeCoord={
                  currentLocation 
                    ? currentLocation
                    : (order?.shippingAddress?.lat && order?.shippingAddress?.lng)
                      ? [order.shippingAddress.lat, order.shippingAddress.lng]
                      : geocodedCustomerCoord 
                        ? geocodedCustomerCoord 
                        : [12.9716, 77.5946] // ultimate fallback if no rider and no customer
                } 
                customerCoord={
                  order?.user?.currentLocation?.latitude && order?.user?.currentLocation?.longitude
                    ? [order.user.currentLocation.latitude, order.user.currentLocation.longitude]
                    : (order?.shippingAddress?.lat && order?.shippingAddress?.lng)
                      ? [order.shippingAddress.lat, order.shippingAddress.lng]
                      : geocodedCustomerCoord 
                        ? geocodedCustomerCoord 
                        : currentLocation 
                          ? [currentLocation[0] + 0.01, currentLocation[1] + 0.01] // 1km offset from rider
                          : [12.9716, 77.5946]
                }
                riderCoord={currentLocation || null}
              />
              
              <div className="flex items-center gap-4 border-t border-zinc-100 px-6 py-5 bg-zinc-50/50">
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 shadow-inner">
                  <Bike size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-extrabold text-zinc-900 truncate">
                    {customerView ? (order?.assignedTo?.name || 'Assigning Partner...') : `Order for ${order?.user?.name || 'Customer'}`}
                  </p>
                  <p className="text-sm text-zinc-500 truncate mt-0.5">
                    {customerView ? 'Delivery partner' : `${order?.shippingAddress?.street}, ${order?.shippingAddress?.city}`}
                  </p>
                </div>
                <button className="grid size-12 shrink-0 place-items-center rounded-full bg-zinc-900 text-white shadow-md hover:bg-zinc-800 transition">
                  <Phone size={18} />
                </button>
              </div>
            </section>
          )}

          {/* Details & Actions Section */}
          <section className="flex flex-col gap-6">
            
            {/* Order Details Timeline */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Order {order?._id?.substring(0, 8)}</p>
                  <h2 className="mt-1 text-lg font-extrabold text-zinc-900">{order?.items?.length || 0} items</h2>
                </div>
                <p className="text-xl font-extrabold text-emerald-600">₹{order?.totalAmount || 0}</p>
              </div>
              
              <div className="flex flex-col gap-5">
                {deliverySteps.map((step, index) => { 
                  const done = index < (
                    status === 'Delivered' ? 5 : 
                    status === 'On the way' ? 4 : 
                    status === 'Picked up' ? 3 : 2
                  ); 
                  
                  return (
                    <div key={step} className="flex items-center gap-4 relative">
                      {/* Timeline connecting line */}
                      {index !== deliverySteps.length - 1 && (
                        <div className={`absolute left-3.5 top-8 bottom-[-20px] w-0.5 ${done ? 'bg-emerald-500' : 'bg-zinc-100'}`} />
                      )}
                      
                      <div className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full shadow-sm transition-colors ${done ? 'bg-emerald-500 text-white' : 'border border-zinc-200 bg-zinc-50 text-zinc-400'}`}>
                        {done ? <Check size={16} strokeWidth={3} /> : <span className="text-[11px] font-bold">{index + 1}</span>}
                      </div>
                      <span className={`text-sm font-bold ${done ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        {step}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Rider Action Button */}
            {!customerView && (
              <button 
                onClick={handleNextStatus} 
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-base font-bold text-white shadow-lg transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                {status === 'Delivered' ? 'Finish Delivery' : `Mark as ${nextStatus}`}
                <ChevronRight size={20} />
              </button>
            )}

            {/* Safe Delivery Tip */}
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-extrabold text-emerald-800">
                <ShieldCheck size={18} className="text-emerald-600" /> 
                Safe delivery checklist
              </p>
              <p className="mt-2 text-xs leading-5 text-emerald-700/80 font-medium">
                Keep the order upright, confirm the customer name, and hand over only after the delivery PIN is verified.
              </p>
            </div>

          </section>
        </div>
        )}
      </main>

      {/* Profile Edit Modal */}
      {showProfileModal && !customerView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="rounded-full p-2 bg-zinc-100 hover:bg-zinc-200">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-semibold text-zinc-700">Full Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-700">Phone Number</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-700">Vehicle Type</label>
                <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white">
                  <option value="BIKE">Bike</option>
                  <option value="SCOOTER">Scooter</option>
                  <option value="BICYCLE">Bicycle</option>
                </select>
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className="mt-4 w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
