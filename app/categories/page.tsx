'use client'

import { CategoryStrip, ProductGrid, Shell, useCart } from '@/components/storefront-shell'
import { products } from '@/lib/store-data'

export default function CategoriesPage() { const { cart, update } = useCart(); return <Shell cart={cart} update={update}><section className="mx-auto w-full px-5 py-10 lg:px-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#789080]">Browse the essentials</p><h1 className="mt-2 text-4xl font-extrabold tracking-[-0.05em]">Shop every essential</h1><p className="mt-3 max-w-xl text-[#789080]">Fresh picks and everyday essentials, organized for a faster shop.</p><div className="mt-7"><CategoryStrip /></div><h2 className="mt-12 text-2xl font-extrabold">All groceries</h2><div className="mt-5"><ProductGrid items={products} cart={cart} update={update} /></div></section></Shell> }
