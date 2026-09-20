'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Clock3, Plus, Minus, Star, Heart, Share2 } from 'lucide-react'
import { money } from '@/lib/store-data'
import { ProductGrid, Shell, useCart, showToast, openCart } from '@/components/storefront-shell'
import { useEffect, useState } from 'react'

export default function ProductDetailPage() { 
  const params = useParams<{ id: string }>(); 
  const router = useRouter();
  const { cart, update } = useCart(); 
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${params.id}`).then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ]).then(([prodData, allProds]) => {
      if (prodData && prodData.name) {
        setProduct(prodData);
        if (Array.isArray(allProds)) {
          setRelated(allProds.filter(p => p.category === prodData.category && p._id !== prodData._id).slice(0, 4));
        }
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [params.id]);

  const count = product ? (cart[product._id]?.count ?? 0) : 0;
  const oldP = product?.oldPrice || product?.old;

  const handleAdd = () => {
    update(product, 1);
    showToast(product.name, product.image);
    openCart();
  };

  if (loading) return (
    <Shell cart={cart} update={update}>
      <section className="mx-auto max-w-5xl px-5 py-20 lg:px-8 animate-pulse">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="aspect-square rounded-3xl bg-zinc-200/50"></div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="h-6 w-32 bg-zinc-200/50 rounded-full"></div>
            <div className="h-12 w-3/4 bg-zinc-200/50 rounded-xl"></div>
            <div className="h-24 w-full bg-zinc-200/50 rounded-xl"></div>
          </div>
        </div>
      </section>
    </Shell>
  );

  if (!product) return <Shell cart={cart} update={update}><section className="mx-auto max-w-5xl px-5 py-20 lg:px-8 text-center"><h1 className="text-3xl font-black text-zinc-900">Product not found</h1><p className="mt-4 text-zinc-500">The product you are looking for does not exist.</p><button onClick={() => router.push('/')} className="mt-8 rounded-full bg-emerald-600 px-8 py-3 font-bold text-white shadow-lg shadow-emerald-500/30">Go back home</button></section></Shell>; 
  
  return (
    <Shell cart={cart} update={update}>
      <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex gap-2">
            <button className="grid size-10 place-items-center rounded-full bg-white border border-zinc-200 text-zinc-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-colors shadow-sm"><Heart size={18} /></button>
            <button className="grid size-10 place-items-center rounded-full bg-white border border-zinc-200 text-zinc-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 transition-colors shadow-sm"><Share2 size={18} /></button>
          </div>
        </div>
        
        <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto w-full max-w-sm aspect-square rounded-[2rem] bg-zinc-50/50 border border-zinc-100 shadow-sm overflow-hidden flex items-center justify-center">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply transition-transform hover:scale-105 duration-700" />
            {(product.isDeal || product.deal) && <span className="absolute left-6 top-6 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-1.5 text-[10px] font-black tracking-widest text-white shadow-md shadow-rose-500/20">HOT DEAL</span>}
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700">{product.category}</span>
              <div className="flex items-center gap-1 text-yellow-400"><Star size={14} className="fill-yellow-400" /><Star size={14} className="fill-yellow-400" /><Star size={14} className="fill-yellow-400" /><Star size={14} className="fill-yellow-400" /><Star size={14} className="fill-yellow-400 text-zinc-300" /><span className="text-xs font-bold text-zinc-500 ml-1">(124)</span></div>
            </div>
            
            <h1 className="mt-4 text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 leading-tight">{product.name}</h1>
            <p className="mt-2 text-sm font-bold uppercase tracking-wider text-zinc-400">{product.detail}</p>
            
            <p className="mt-6 text-lg leading-relaxed text-zinc-600">{product.description || "Fresh and premium quality product selected carefully for you."}</p>
            
            <div className="mt-8 flex items-end gap-4">
              <span className="text-4xl font-black text-zinc-900 tracking-tight">{money(product.price)}</span>
              {oldP && <del className="text-lg font-bold text-zinc-400 mb-1">{money(oldP)}</del>}
            </div>
            
            <div className="mt-10">
              {count > 0 ? (
                <div className="flex w-fit items-center gap-4 rounded-full bg-zinc-100 p-2 shadow-inner border border-zinc-200">
                  <button onClick={() => update(product, -1)} className="grid size-12 place-items-center rounded-full bg-white text-zinc-600 hover:bg-zinc-50 shadow-sm transition-all active:scale-95"><Minus size={20} strokeWidth={3} /></button>
                  <span className="w-8 text-center text-xl font-black text-zinc-900">{count}</span>
                  <button onClick={() => update(product, 1)} className="grid size-12 place-items-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95"><Plus size={20} strokeWidth={3} /></button>
                </div>
              ) : (
                <button onClick={handleAdd} className="flex w-full md:w-fit items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-10 py-4 text-lg font-black text-white shadow-xl shadow-emerald-500/30 hover:-translate-y-1 hover:shadow-emerald-500/40 transition-all">
                  <Plus size={22} strokeWidth={3} /> Add to Basket
                </button>
              )}
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-8">
              <div className="flex items-center gap-3 text-zinc-600">
                <div className="grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Clock3 size={18} /></div>
                <span className="text-sm font-bold leading-tight">10 MIN<br/><span className="text-zinc-400 font-medium">Delivery</span></span>
              </div>
              <div className="flex items-center gap-3 text-zinc-600">
                <div className="grid size-10 place-items-center rounded-full bg-blue-50 text-blue-600"><Check size={18} /></div>
                <span className="text-sm font-bold leading-tight">100%<br/><span className="text-zinc-400 font-medium">Freshness</span></span>
              </div>
            </div>
          </div>
        </div>
        
        {related.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Similar Products</h2>
            </div>
            <ProductGrid items={related} cart={cart} update={update} />
          </div>
        )}
      </section>
    </Shell>
  );
}
