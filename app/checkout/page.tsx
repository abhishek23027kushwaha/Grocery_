'use client'

import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, Check, MapPin, Search } from 'lucide-react'
import { Shell, useCart } from '@/components/storefront-shell'
import { money, cartItems } from '@/lib/store-data'
import dynamic from 'next/dynamic'

const CheckoutMap = dynamic(() => import('@/components/checkout-map'), { 
  ssr: false, 
  loading: () => <div className="h-[250px] w-full rounded-xl bg-zinc-100 animate-pulse flex items-center justify-center text-sm text-zinc-500">Loading Map...</div> 
})

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, update, total } = useCart()
  const [placed, setPlaced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [user, setUser] = useState<any>(null)
  
  // Location States
  const [position, setPosition] = useState<[number, number]>([12.9716, 77.5946]); // Default Bengaluru
  const [address, setAddress] = useState('12 Green Avenue, Koramangala, Bengaluru');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        setUser(JSON.parse(userStr))
      } else {
        router.push('/login')
      }
    } catch (e) {
      router.push('/login')
    }

    const fetchExactLocation = () => {
      // First check if navbar already saved exact location
      const savedLat = localStorage.getItem('userLat');
      const savedLng = localStorage.getItem('userLng');
      if (savedLat && savedLng) {
        setPosition([parseFloat(savedLat), parseFloat(savedLng)]);
        return; // Use the exact same location as navbar
      }

      // Second fallback: If they have a city saved but no coordinates (from old code)
      const savedCity = localStorage.getItem('userCity');
      if (savedCity && savedCity !== 'Select Location') {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(savedCity)}&limit=1`)
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            }
          })
          .catch(e => console.error(e));
        return;
      }

      // Otherwise fetch it again like the navbar does
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setPosition([pos.coords.latitude, pos.coords.longitude]);
          },
          async (err) => {
            console.log("Exact location access denied/failed, using IP fallback.");
            try {
              // Free IP-based location fallback (No API Key required)
              const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
              const data = await res.json();
              if (data.latitude && data.longitude) {
                setPosition([data.latitude, data.longitude]);
              }
            } catch (e) {}
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    };
    fetchExactLocation();
  }, [])

  // Reverse Geocoding when pin moves
  useEffect(() => {
    const getAddress = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`);
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        }
      } catch (err) {
        console.error("Reverse Geocoding error", err);
      }
    };
    const timer = setTimeout(() => getAddress(), 600);
    return () => clearTimeout(timer);
  }, [position]);

  // Autocomplete search
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    const searchLocation = async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    };
    const timer = setTimeout(() => searchLocation(), 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSuggestion = (place: any) => {
    setPosition([parseFloat(place.lat), parseFloat(place.lon)]);
    setAddress(place.display_name);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handlePayment = async () => {
    if (paymentMethod === 'cod') {
      setLoading(true)
      try {
        const orderData = {
          user: user?._id || user?.id || '60d0fe4f5311236168a109ca',
          items: cartItems(cart).map(item => ({
            product: item.product._id || item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.count,
            image: item.product.image
          })),
          totalAmount: total,
          paymentMethod: 'cod',
          shippingAddress: {
            street: address,
            city: address.split(',')[0],
            postalCode: '560000',
            country: 'India'
          }
        }
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        })
        if (res.ok) {
          setPlaced(true)
        } else {
          alert('Failed to place COD order')
        }
      } catch (err) {
        console.error(err)
        alert('Something went wrong')
      } finally {
        setLoading(false)
      }
      return
    }

    // Razorpay Flow
    setLoading(true)
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      })
      
      const order = await res.json()
      
      if (!res.ok) throw new Error(order.error || 'Failed to create order')

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Grovli',
        description: 'Grocery Delivery',
        order_id: order.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user?._id || user?.id || '60d0fe4f5311236168a109ca', // Dummy user ID if guest
                items: cartItems(cart).map(item => ({
                  product: item.product._id || item.product.id,
                  name: item.product.name,
                  price: item.product.price,
                  quantity: item.count,
                  image: item.product.image
                })),
                totalAmount: total,
                shippingAddress: {
                  street: address,
                  city: address.split(',')[0],
                  postalCode: '560000',
                  country: 'India'
                }
              })
            })
            
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              setPlaced(true)
            } else {
              alert('Payment verification failed!')
            }
          } catch (err) {
            console.error(err)
            alert('Something went wrong during verification')
          }
        },
        prefill: {
          name: user?.name || 'Guest User',
          email: user?.email || 'guest@example.com',
          contact: user?.phone || '9999999999'
        },
        theme: {
          color: '#1c4a31'
        }
      }

      const rzp1 = new (window as any).Razorpay(options)
      rzp1.on('payment.failed', function (response: any) {
        alert(response.error.description)
      })
      rzp1.open()
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error processing payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell cart={cart} update={update}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        <Link href="/cart" className="flex items-center gap-2 text-sm font-bold text-[#639443]">
          <ArrowLeft size={16} /> Back to cart
        </Link>
        {placed ? (
          <div className="mx-auto mt-16 max-w-lg rounded-3xl bg-[#e4f4d3] p-10 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#d9f04a] text-[#173423]">
              <Check />
            </span>
            <h1 className="mt-5 text-3xl font-extrabold">Order placed</h1>
            <p className="mt-3 text-[#58715e]">Your groceries are on the way. Estimated delivery: 10–20 minutes.</p>
            <Link href="/account" className="mt-7 inline-flex rounded-xl bg-[#1c4a31] px-5 py-3 text-sm font-bold text-white">
              View order
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-7 text-4xl font-extrabold tracking-[-0.05em]">Checkout</h1>
            <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
              <div className="flex flex-col gap-5 min-w-0">
                <div className="rounded-2xl border border-[#e9eee7] bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e9f4d9] text-[#4f823d]">
                      <MapPin size={19} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-extrabold">Delivery address</h2>
                      <p className="text-sm text-[#789080] truncate">{address}</p>
                    </div>
                  </div>
                  
                  <div className="mt-5 relative z-20">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search for a building, street, or area..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-[#e9eee7] bg-[#f9fbf8] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#a9ca83] focus:ring-2 focus:ring-[#e4f4d3] transition-all"
                      />
                    </div>
                    {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-white shadow-xl border border-zinc-100 overflow-hidden z-30">
                        {suggestions.map((place, idx) => (
                          <div 
                            key={idx} 
                            className="px-4 py-3 hover:bg-emerald-50 cursor-pointer text-sm text-zinc-700 transition-colors border-b border-zinc-50 last:border-0"
                            onClick={() => handleSelectSuggestion(place)}
                          >
                            <p className="font-medium text-zinc-900 truncate">{place.name}</p>
                            <p className="text-xs text-zinc-500 truncate">{place.display_name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <CheckoutMap position={position} onPositionChange={setPosition} />
                  </div>
                </div>
                <div className="rounded-2xl border border-[#e9eee7] bg-white p-5">
                  <h2 className="font-extrabold">Payment method</h2>
                  <label className={`mt-4 flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition ${paymentMethod === 'cod' ? 'border-[#a9ca83] bg-[#f3f8f0]' : 'border-[#e9eee7]'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> Cash on delivery
                  </label>
                  <label className={`mt-3 flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition ${paymentMethod === 'razorpay' ? 'border-[#a9ca83] bg-[#f3f8f0]' : 'border-[#e9eee7]'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} /> UPI / Card (Razorpay)
                  </label>
                </div>
              </div>
              <div className="rounded-2xl border border-[#e9eee7] bg-white p-5 sticky top-24">
                <h2 className="font-extrabold">Order total</h2>
                <div className="mt-5 flex justify-between text-sm text-[#789080]">
                  <span>Items</span>
                  <b className="text-[#15251d]">{money(total)}</b>
                </div>
                <div className="mt-3 flex justify-between text-sm text-[#789080]">
                  <span>Delivery</span>
                  <b className="text-[#4f823d]">FREE</b>
                </div>
                <div className="mt-4 flex justify-between border-t border-[#edf0eb] pt-4">
                  <span className="font-bold">Pay</span>
                  <b className="text-lg">{money(total)}</b>
                </div>
                <button 
                  onClick={handlePayment} 
                  disabled={loading || total <= 0}
                  className="mt-6 w-full rounded-xl bg-[#1c4a31] px-4 py-3.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place order' : 'Pay now'}
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </Shell>
  )
}
