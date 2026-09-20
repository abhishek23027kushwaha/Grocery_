'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowRight, ChevronDown, MapPin, Minus, Plus, Search, ShoppingBasket, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { cartCount, cartItems, cartTotal, categoryFor, categories, categoryTint, money, navLinks, pageMaxWidth, products, productUrl, type Product } from '@/lib/store-data'
import { useAddToCartAnimation } from '@/components/animations/add-to-cart-effect'

export type Cart = Record<string | number, any>

let globalCart: Cart = {}
const cartListeners = new Set<() => void>()

function subscribeCart(listener: () => void) {
  cartListeners.add(listener)
  return () => cartListeners.delete(listener)
}

function getCartSnapshot() {
  return globalCart
}

function updateGlobalCart(product: any, amount: number) {
  const id = product._id || product.id;
  const currentCount = globalCart[id]?.count ?? 0;
  const nextAmount = Math.max(0, Math.min(9, currentCount + amount));
  
  if (nextAmount === 0) {
    const newCart = { ...globalCart };
    delete newCart[id];
    globalCart = newCart;
  } else {
    globalCart = { ...globalCart, [id]: { product, count: nextAmount } };
  }
  
  cartListeners.forEach((l) => l());
}

let globalCartOpen = false
let globalToast: { id: number; message: string; name: string; image?: string } | null = null
let uiSnapshot: { cartOpen: boolean, toast: typeof globalToast } = { cartOpen: globalCartOpen, toast: globalToast }
const uiListeners = new Set<() => void>()

function updateUI() { 
  uiSnapshot = { cartOpen: globalCartOpen, toast: globalToast }
  uiListeners.forEach(l => l()) 
}

export function openCart() { globalCartOpen = true; updateUI() }
export function closeCart() { globalCartOpen = false; updateUI() }
export function showToast(name: string, image?: string) {
  globalToast = { id: Date.now(), message: `Added to cart`, name, image }
  updateUI()
  setTimeout(() => { globalToast = null; updateUI() }, 3000)
}

export function useStoreUI() {
  return useSyncExternalStore(
    (l) => { uiListeners.add(l); return () => uiListeners.delete(l) },
    () => uiSnapshot,
    () => uiSnapshot
  )
}

export function useCart() {
  const cart = useSyncExternalStore(subscribeCart, getCartSnapshot, getCartSnapshot)
  return { cart, update: updateGlobalCart, count: cartCount(cart), total: cartTotal(cart) }
}

export function Header({ count = 0, query = '', onQueryChange }: { count?: number; query?: string; onQueryChange?: (value: string) => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const [localQuery, setLocalQuery] = useState(query)
  const [userName, setUserName] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [city, setCity] = useState<string>('Select Location')
  const [isLocating, setIsLocating] = useState(false)

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user && user.name) {
          setUserName(user.name.charAt(0).toUpperCase() + user.name.slice(1))
        }
      }
      const cachedCity = localStorage.getItem('userCity')
      if (cachedCity) setCity(cachedCity)
    } catch (e) {}
  }, [])

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          // Using free Nominatim API (No API Key required)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          const cityName = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Unknown Location';
          
          setCity(cityName);
          localStorage.setItem('userCity', cityName);
          localStorage.setItem('userLat', lat.toString());
          localStorage.setItem('userLng', lng.toString());
        } catch (error) {
          console.error("Error fetching city:", error);
          alert("Could not fetch location name.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Location access denied or unavailable.");
        setIsLocating(false);
      }
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUserName(null)
    setIsDropdownOpen(false)
    router.push('/')
  };

  const value = onQueryChange ? query : localQuery
  function change(value: string) { setLocalQuery(value); onQueryChange?.(value) }
  return <>
    <div className="bg-emerald-950 px-4 py-2 text-center text-xs font-medium text-emerald-100 tracking-wide shadow-sm">Free delivery on your first order Â· Use code <b className="text-white ml-1 bg-emerald-800 px-2 py-0.5 rounded text-[10px]">WELCOME50</b></div>
    <div className="sticky top-4 z-40 px-4 max-w-7xl mx-auto w-full transition-all duration-300">
      <header className="rounded-full border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 group">
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <ShoppingBasket size={18} strokeWidth={2.5} />
            </span>
            <span className="text-xl font-black tracking-tighter text-zinc-900 hidden sm:block">grovli<span className="text-emerald-500">.</span></span>
          </Link>
          
          <button onClick={fetchLocation} disabled={isLocating} className="hidden items-center gap-2 rounded-full bg-white/50 px-4 py-2 text-left text-sm md:flex hover:bg-white/80 transition-colors border border-zinc-100 disabled:opacity-70 disabled:cursor-wait" aria-label="Choose delivery location">
            <MapPin size={16} className={`text-emerald-500 ${isLocating ? 'animate-bounce' : ''}`} />
            <span className="leading-tight w-28 truncate"><b className="block text-[10px] uppercase tracking-widest text-zinc-400">Deliver to</b><span className="font-medium text-zinc-700">{isLocating ? 'Locating...' : city}</span></span>
            <ChevronDown size={14} className="ml-1 text-zinc-400 shrink-0" />
          </button>
          
          <label className="relative mx-auto flex flex-1 items-center max-w-lg transition-all group">
            <Search className="absolute left-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input value={value} onChange={(event) => change(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') router.push(`/search?q=${encodeURIComponent(value)}`) }} placeholder="Search for groceries, fruits..." className="h-11 w-full rounded-full border-none bg-zinc-100/50 pl-11 pr-4 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:shadow-md" />
          </label>
      {userName ? (
        <div className="relative hidden sm:block ml-2">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 rounded-full p-1 hover:bg-zinc-100 transition-colors">
            <span className="grid size-9 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-700 shadow-sm border border-emerald-200">{userName.charAt(0)}</span>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 top-14 w-48 rounded-2xl border border-white/50 bg-white/90 backdrop-blur-xl p-2 shadow-xl z-50 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
              <Link href="/account" onClick={() => setIsDropdownOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100/80 hover:text-emerald-600 transition-colors">My Profile</Link>
              <Link href="/orders" onClick={() => setIsDropdownOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100/80 hover:text-emerald-600 transition-colors">My Orders</Link>
              <div className="my-1 border-t border-zinc-100/80"></div>
              <button onClick={handleLogout} className="block w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors">Logout</button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" className={`hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold sm:flex ml-2 ${pathname === '/login' ? 'bg-emerald-50 text-emerald-600' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all'}`}>
          <UserRound size={18} /> Account
        </Link>
      )}
      
      <div className="flex items-center gap-2 ml-1">
        <button id="cart-icon" onClick={openCart} className="relative flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 hover:shadow-zinc-900/30 hover:-translate-y-0.5 transition-all group">
          <ShoppingBasket size={18} className="group-hover:animate-bounce" />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-emerald-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-in zoom-in-50">{count}</span>}
        </button>
      </div>
        </div>
      </header>
    </div>
  </>
}

export function Footer() { 
  return (
    <footer className="mt-20 border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="flex shrink-0 items-center gap-2 group mb-6">
              <span className="grid size-10 place-items-center rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                <ShoppingBasket size={20} strokeWidth={2.5} />
              </span>
              <span className="text-2xl font-black tracking-tighter text-zinc-900">grovli<span className="text-emerald-500">.</span></span>
            </Link>
            <p className="max-w-xs text-sm leading-6 text-zinc-500">
              Fresh groceries, thoughtfully handpicked and delivered to your doorstep in minutes. Quality you can taste.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a href="#" className="text-zinc-400 hover:text-emerald-500 transition-colors"><span className="sr-only">Facebook</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></a>
              <a href="#" className="text-zinc-400 hover:text-emerald-500 transition-colors"><span className="sr-only">Instagram</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg></a>
              <a href="#" className="text-zinc-400 hover:text-emerald-500 transition-colors"><span className="sr-only">Twitter</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 lg:col-span-2 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 tracking-wider uppercase">Shop</h3>
              <ul className="mt-6 space-y-4">
                <li><Link href="/categories" className="text-sm text-zinc-500 hover:text-emerald-600 transition-colors">All Categories</Link></li>
                <li><Link href="/deals" className="text-sm text-zinc-500 hover:text-emerald-600 transition-colors">Fresh Deals</Link></li>
                <li><Link href="/delivery" className="text-sm text-zinc-500 hover:text-emerald-600 transition-colors">Delivery Info</Link></li>
                <li><Link href="/track-order" className="text-sm text-zinc-500 hover:text-emerald-600 transition-colors">Track Order</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 tracking-wider uppercase">Company</h3>
              <ul className="mt-6 space-y-4">
                <li><a href="#" className="text-sm text-zinc-500 hover:text-emerald-600 transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-zinc-500 hover:text-emerald-600 transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-zinc-500 hover:text-emerald-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-zinc-500 hover:text-emerald-600 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 tracking-wider uppercase">Need Help?</h3>
              <ul className="mt-6 space-y-4">
                <li className="text-sm text-zinc-500">Call Us: <a href="tel:+918000012345" className="font-semibold text-emerald-600 hover:text-emerald-700">+91 80000 12345</a></li>
                <li className="text-sm text-zinc-500">Email: <a href="mailto:hello@grovli.example" className="font-semibold text-emerald-600 hover:text-emerald-700">hello@grovli.example</a></li>
                <li className="text-sm text-zinc-500 mt-4">123 Green Market Street,<br />Bengaluru, KA 560001</li>
              </ul>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <h3 className="text-sm font-bold text-zinc-900 tracking-wider uppercase">Subscribe</h3>
            <p className="mt-4 text-sm text-zinc-500">Get fresh deals and news delivered straight to your inbox.</p>
            <form className="mt-6 sm:flex sm:max-w-md">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input type="email" name="email-address" id="email-address" autoComplete="email" required className="w-full min-w-0 appearance-none rounded-full border-0 bg-zinc-100/80 px-4 py-3 text-base text-zinc-900 placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500 sm:text-sm shadow-inner" placeholder="Enter your email" />
              <div className="mt-3 rounded-md sm:ml-3 sm:mt-0 sm:shrink-0">
                <button type="submit" className="flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/40 hover:-translate-y-0.5">Subscribe</button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-16 border-t border-zinc-100 pt-8 sm:mt-20 md:flex md:items-center md:justify-between">
          <p className="mt-8 text-xs leading-5 text-zinc-400 md:order-1 md:mt-0">&copy; 2026 grovli. Designed for a premium grocery experience.</p>
        </div>
      </div>
    </footer>
  );
}

export function ProductCard({ product, count = 0, onUpdate }: { product: any; count?: number; onUpdate?: (product: any, amount: number) => void }) { 
  const id = product._id || product.id;
  const oldP = product.oldPrice || product.old;
  const { triggerAnimation } = useAddToCartAnimation();
  const handleAdd = (e: React.MouseEvent) => {
    onUpdate?.(product, 1);
    showToast(product.name, product.image);
    triggerAnimation(e.clientX, e.clientY);
  };
  return <article className="group relative flex flex-col rounded-[24px] border border-zinc-100/80 bg-white p-3 shadow-[0_2px_20px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(16,185,129,0.08)] hover:border-emerald-100 dark:bg-zinc-900 dark:border-zinc-800"><Link href={productUrl(id)} className="relative block overflow-hidden rounded-[18px] bg-zinc-50/50 dark:bg-zinc-800/50"><img src={product.image} alt={product.name} className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal" />{(product.isDeal || product.deal) && <span className="absolute left-2.5 top-2.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-2.5 py-1 text-[9px] font-black tracking-widest text-white shadow-md shadow-rose-500/20">HOT DEAL</span>}</Link><div className="flex flex-1 flex-col px-2 pb-2 pt-4"><Link href={productUrl(id)} className="block truncate text-[15px] font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">{product.name}</Link><p className="mt-0.5 text-xs font-medium text-zinc-400">{product.detail}</p><div className="mt-auto pt-4 flex items-center justify-between"><div><span className="text-[17px] font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{money(product.price)}</span> {oldP && <del className="text-xs font-semibold text-zinc-300 ml-1.5">{money(oldP)}</del>}</div>{count > 0 && onUpdate ? <div className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 p-1 text-emerald-700 dark:text-emerald-400 shadow-inner border border-emerald-100 dark:border-emerald-800"><button onClick={() => onUpdate(product, -1)} aria-label={`Remove one ${product.name}`} className="hover:bg-white dark:hover:bg-emerald-900 rounded-full p-1.5 transition-colors shadow-sm"><Minus size={14} strokeWidth={3} /></button><span className="min-w-6 text-center text-sm font-bold tabular-nums">{count}</span><button onClick={(e) => { onUpdate(product, 1); triggerAnimation(e.clientX, e.clientY); }} aria-label={`Add one ${product.name}`} className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full p-1.5 transition-colors shadow-md shadow-emerald-500/30"><Plus size={14} strokeWidth={3} /></button></div> : <button onClick={handleAdd} className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-black text-zinc-800 dark:text-zinc-200 transition-all hover:bg-emerald-500 hover:border-emerald-500 hover:text-white dark:hover:text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20 active:scale-95">ADD</button>}</div></div></article> 
}

export function ProductGrid({ items, cart, update }: { items: any[]; cart: Cart; update: (product: any, amount: number) => void }) { return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">{items.map((product) => {
  const id = product._id || product.id;
  return <ProductCard key={id} product={product} count={cart[id]?.count ?? 0} onUpdate={update} />
})}</div> }

export function CategoryStrip({ items }: { items?: any[] }) { 
  const displayItems = items || categories;
  return <div className="flex flex-nowrap overflow-x-auto gap-4 sm:flex-wrap sm:justify-center sm:gap-6 sm:overflow-visible pb-4 sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
    {displayItems.map((category) => 
      <Link key={category.slug} href={`/categories/${category.slug}`} className="flex-shrink-0 w-24 sm:w-[104px] group flex flex-col items-center gap-3 transition-all">
        <div className="relative size-20 sm:size-[88px] rounded-full bg-emerald-50/50 border border-emerald-100/50 p-2 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-100/50 group-hover:shadow-emerald-900/10 group-hover:border-emerald-300">
          <img src={category.image || '/placeholder.png'} alt={category.name} className="size-full rounded-full object-cover mix-blend-multiply" />
        </div>
        <span className="text-[13px] font-bold text-zinc-700 text-center leading-tight group-hover:text-emerald-600 transition-colors">{category.name}</span>
      </Link>
    )}
  </div> 
}

export function MiniCart({ cart, update }: { cart: Cart; update: (product: any, amount: number) => void }) { const items = useMemo(() => cartItems(cart), [cart]); return <aside className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"><h2 className="font-extrabold text-zinc-900">Order summary</h2><div className="mt-4 flex flex-col gap-3">{items.map(({ product, count }) => <div key={product._id || product.id} className="flex items-center justify-between gap-3 text-sm text-zinc-700"><span className="truncate">{product.name} × {count}</span><b className="text-zinc-900">{money(product.price * count)}</b></div>)}</div><div className="mt-5 flex justify-between border-t border-zinc-100 pt-4"><span className="text-sm text-zinc-500">Subtotal</span><b className="text-zinc-900">{money(cartTotal(cart))}</b></div><Link href="/checkout" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 hover:-translate-y-0.5 transition-all">Checkout <ArrowRight size={16} /></Link></aside> }

export const getCategoryName = (slug: string) => categoryFor(slug)?.name ?? 'All groceries'
export const getCategoryImage = (slug: string) => categoryFor(slug)?.image ?? categories[0].image
export const getCategoryProducts = (slug: string) => products.filter((product) => product.category === slug)

export function Shell({ children, cart, update, query, onQueryChange }: { children: React.ReactNode; cart: Cart; update: (product: any, amount: number) => void; query?: string; onQueryChange?: (value: string) => void }) { 
  const { cartOpen, toast } = useStoreUI();
  const items = useMemo(() => cartItems(cart), [cart]);
  
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-emerald-500 selection:text-white">
      <Header count={cartCount(cart)} query={query} onQueryChange={onQueryChange} />
      {children}
      <Footer />
      
      {/* Toast Notification */}
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toast ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
        {toast && (
          <div className="flex items-center gap-3 rounded-full bg-zinc-900 px-4 py-3 text-white shadow-2xl border border-white/10">
            {toast.image && <img src={toast.image} className="size-8 rounded-full object-cover border border-zinc-700 bg-zinc-800" alt="" />}
            <div>
              <p className="text-sm font-medium">{toast.name}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{toast.message}</p>
            </div>
            <div className="ml-2 grid size-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
        )}
      </div>

      {/* Cart Drawer Overlay */}
      {cartOpen && <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm transition-opacity" onClick={closeCart} />}
      
      {/* Cart Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm transform bg-white shadow-2xl transition-transform duration-500 ease-in-out ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
            <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2"><ShoppingBasket size={20} className="text-emerald-500" /> Your Basket</h2>
            <button onClick={closeCart} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors">
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center opacity-50">
                <ShoppingBasket size={48} className="mb-4 text-zinc-300" />
                <p className="text-lg font-bold text-zinc-500">Your basket is empty</p>
                <p className="text-sm text-zinc-400">Time to add some fresh groceries!</p>
                <button onClick={closeCart} className="mt-6 rounded-full bg-zinc-100 px-6 py-2.5 text-sm font-bold text-zinc-900 hover:bg-zinc-200 transition-colors">Start Shopping</button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {items.map(({ product, count }) => (
                  <div key={product.id || product._id} className="flex gap-4">
                    <img src={product.image} alt={product.name} className="h-16 w-16 rounded-xl object-cover mix-blend-multiply" />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-zinc-800">{product.name}</h3>
                      <p className="text-xs text-zinc-400 font-medium">{product.detail}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm font-black text-zinc-900">{money(product.price)}</div>
                        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 shadow-inner">
                          <button onClick={() => update(product, -1)} className="grid size-6 place-items-center rounded-full bg-white text-zinc-500 hover:text-rose-500 shadow-sm transition-colors"><Minus size={12} strokeWidth={3} /></button>
                          <span className="min-w-[1.25rem] text-center text-sm font-bold">{count}</span>
                          <button onClick={() => update(product, 1)} className="grid size-6 place-items-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"><Plus size={12} strokeWidth={3} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {items.length > 0 && (
            <div className="border-t border-zinc-100 bg-zinc-50 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-zinc-500">Subtotal</span>
                <span className="text-xl font-black text-zinc-900">{money(cartTotal(cart))}</span>
              </div>
              <Link href="/checkout" onClick={closeCart} className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all">
                Proceed to Checkout <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
