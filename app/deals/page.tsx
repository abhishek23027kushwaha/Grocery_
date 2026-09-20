'use client'

import { ProductGrid, Shell, useCart } from '@/components/storefront-shell'
import { products } from '@/lib/store-data'

export default function DealsPage() { const { cart, update } = useCart(); return <Shell cart={cart} update={update}><section className="mx-auto w-full px-5 py-10 lg:px-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#789080]">Limited-time prices</p><h1 className="mt-2 text-4xl font-extrabold tracking-[-0.05em]">Deals worth grabbing</h1><p className="mt-3 text-[#789080]">The groceries you buy most, at prices you will love.</p><div className="mt-9"><ProductGrid items={products} cart={cart} update={update} /></div></section></Shell> }
