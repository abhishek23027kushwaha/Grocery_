'use client'

import Link from 'next/link'
import { ArrowRight, Clock3, Sparkles, Star, Zap, Leaf, ShieldCheck, Heart, Search } from 'lucide-react'
import { CategoryStrip, ProductGrid, Shell, useCart } from '@/components/storefront-shell'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { cart, update } = useCart()
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ]).then(([cats, prods]) => {
      setCategories(Array.isArray(cats) ? cats : [])
      setProducts(Array.isArray(prods) ? prods : [])
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  const sections = categories.map((category) => ({ 
    category, 
    items: products.filter((product) => product.category === category.slug || product.category === category.name) 
  })).filter((section) => section.items.length)

  const dealProducts = products.filter(p => p.isDeal || p.deal).slice(0, 4)

  if (loading) {
    return (
      <Shell cart={cart} update={update}>
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 max-w-7xl animate-pulse">
          {/* Skeleton Hero */}
          <div className="h-[400px] w-full rounded-[2.5rem] bg-zinc-200/50 mb-16"></div>
          {/* Skeleton Categories */}
          <div className="flex gap-6 mb-16 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="size-20 rounded-full bg-zinc-200/50"></div>
                <div className="h-4 w-16 rounded bg-zinc-200/50"></div>
              </div>
            ))}
          </div>
          {/* Skeleton Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 rounded-3xl bg-zinc-200/50"></div>
            ))}
          </div>
        </div>
      </Shell>
    )
  }

  return <Shell cart={cart} update={update}>
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 pt-2 lg:pt-8 max-w-7xl">
      <div className="relative rounded-[2.5rem] overflow-hidden min-h-[500px] sm:min-h-[600px] flex flex-col justify-center shadow-2xl">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80" alt="Fresh Groceries" className="w-full h-full object-cover" />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/70 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 px-8 sm:px-12 lg:px-20 max-w-3xl text-white">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-emerald-100 shadow-sm">
            <Zap size={14} className="text-yellow-400 fill-yellow-400" /> Lightning Fast Delivery
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-[70px] font-black leading-[1.05] tracking-tight">
            Handpicked<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Freshness.</span>
          </h1>
          
          <p className="mt-6 max-w-lg text-lg sm:text-xl leading-relaxed text-zinc-300 font-medium">
            Delivered to your door in minutes. Farm-fresh produce, daily essentials, and everything your kitchen needs.
          </p>
          
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/categories" className="flex items-center justify-center rounded-full bg-emerald-500 px-8 py-4 text-sm sm:text-base font-black text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 hover:bg-emerald-400">
              Shop Now
            </Link>
            <Link href="/deals" className="flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 text-sm sm:text-base font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-white/20">
              View Deals
            </Link>
          </div>
          
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              <img src="https://i.pravatar.cc/100?img=4" className="w-10 h-10 rounded-full border-2 border-zinc-950 shadow-sm object-cover" alt="User" />
              <img src="https://i.pravatar.cc/100?img=5" className="w-10 h-10 rounded-full border-2 border-zinc-950 shadow-sm object-cover" alt="User" />
              <img src="https://i.pravatar.cc/100?img=6" className="w-10 h-10 rounded-full border-2 border-zinc-950 shadow-sm object-cover" alt="User" />
              <img src="https://i.pravatar.cc/100?img=7" className="w-10 h-10 rounded-full border-2 border-zinc-950 shadow-sm object-cover" alt="User" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <span className="text-xs font-bold text-zinc-300 mt-1">Trusted by <span className="text-white">50,000+</span> customers</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Infinite Marquee */}
      <div className="mt-8 flex w-full overflow-hidden bg-white/50 backdrop-blur-sm border border-zinc-100 rounded-full py-3 shadow-sm relative">
        <div className="animate-marquee flex items-center whitespace-nowrap">
          <div className="flex items-center gap-8 mx-4">
            <span className="flex items-center gap-2 font-bold text-zinc-700"><Zap size={16} className="text-yellow-500 fill-yellow-500" /> 10 Minute Delivery</span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-2 font-bold text-zinc-700"><Leaf size={16} className="text-emerald-500" /> 100% Organic Products</span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-2 font-bold text-zinc-700"><ShieldCheck size={16} className="text-blue-500" /> Trusted by 50,000+ Families</span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-2 font-bold text-zinc-700"><Sparkles size={16} className="text-purple-500" /> Daily Fresh Deals</span>
            <span className="text-zinc-300">•</span>
          </div>
          <div className="flex items-center gap-8 mx-4">
            <span className="flex items-center gap-2 font-bold text-zinc-700"><Zap size={16} className="text-yellow-500 fill-yellow-500" /> 10 Minute Delivery</span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-2 font-bold text-zinc-700"><Leaf size={16} className="text-emerald-500" /> 100% Organic Products</span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-2 font-bold text-zinc-700"><ShieldCheck size={16} className="text-blue-500" /> Trusted by 50,000+ Families</span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-2 font-bold text-zinc-700"><Sparkles size={16} className="text-purple-500" /> Daily Fresh Deals</span>
            <span className="text-zinc-300">•</span>
          </div>
          <div className="flex items-center gap-8 mx-4">
            <span className="flex items-center gap-2 font-bold text-zinc-700"><Zap size={16} className="text-yellow-500 fill-yellow-500" /> 10 Minute Delivery</span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-2 font-bold text-zinc-700"><Leaf size={16} className="text-emerald-500" /> 100% Organic Products</span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-2 font-bold text-zinc-700"><ShieldCheck size={16} className="text-blue-500" /> Trusted by 50,000+ Families</span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-2 font-bold text-zinc-700"><Sparkles size={16} className="text-purple-500" /> Daily Fresh Deals</span>
            <span className="text-zinc-300">•</span>
          </div>
        </div>
      </div>
      
      {/* Category Section */}
      <div className="mt-16 flex items-end justify-between px-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Heart size={16} className="text-rose-500 fill-rose-500" />
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Shop by category</p>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">Explore Aisles</h2>
        </div>
        <Link href="/categories" className="hidden items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors sm:flex">
          View all categories <ArrowRight size={16} />
        </Link>
      </div>
      <div className="mt-6"><CategoryStrip items={categories} /></div>

      {dealProducts.length > 0 && (
        <section className="mt-12 rounded-3xl border border-emerald-100 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-500">Limited-time savings</p>
              <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-zinc-900">Fresh deal today</h2>
              <p className="mt-2 text-sm text-zinc-500">Handpicked offers for your everyday basket.</p>
            </div>
            <Link href="/deals" className="hidden items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors sm:flex">
              See all deals <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-6"><ProductGrid items={dealProducts} cart={cart} update={update} /></div>
        </section>
      )}

      {sections.map(({ category, items }) => (
        <section key={category.slug || category._id} className="mt-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Shop fresh</p>
              <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-zinc-900">{category.name}</h2>
            </div>
            <Link href={`/categories/${category.slug || category._id}`} className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-5"><ProductGrid items={items} cart={cart} update={update} /></div>
        </section>
      ))}
    </section>
  </Shell>
}
