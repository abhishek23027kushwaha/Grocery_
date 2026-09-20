'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'
import { categoryFor } from '@/lib/store-data'
import { Shell, useCart } from '@/components/storefront-shell'

interface DBProduct {
  _id: string
  name: string
  description: string
  detail: string
  price: number
  oldPrice?: number
  image: string
  stock: number
  category: string
  isDeal: boolean
}

export default function CategoryDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const category = categoryFor(slug)
  const { cart, update } = useCart()
  const [products, setProducts] = useState<DBProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/products?category=${slug}`)
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  return (
    <Shell cart={cart} update={update}>
      <section className="mx-auto w-full px-5 py-10 lg:px-8">
        <Link href="/categories" className="flex items-center gap-2 text-sm font-bold text-[#639443]">
          <ArrowLeft size={16} /> All categories
        </Link>

        {category && (
          <div className="mt-8 flex items-center gap-5">
            <img src={category.image} alt={category.name} className="size-20 rounded-2xl object-cover" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#789080]">Category</p>
              <h1 className="text-4xl font-extrabold tracking-[-0.05em]">{category.name}</h1>
              <p className="mt-1 text-sm text-[#789080]">{loading ? 'Loading...' : `${products.length} products`}</p>
            </div>
          </div>
        )}

        <div className="mt-10">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-[#e9eee7] bg-white p-3">
                  <div className="aspect-square w-full rounded-xl bg-[#f0f4ee]" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-[#f0f4ee]" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-[#f0f4ee]" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8e1d5] bg-white py-20 text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-[#eff7e6] text-[#71a344]">
                <Package size={24} />
              </div>
              <h2 className="mt-4 text-lg font-extrabold">No products yet</h2>
              <p className="mt-2 text-sm text-[#789080]">This category has no products. Ask the admin to add some!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map(product => (
                <article key={product._id} className="group rounded-2xl border border-[#e9eee7] bg-white p-3 shadow-[0_2px_10px_rgba(30,60,35,.03)] transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative block overflow-hidden rounded-xl bg-[#f5f7f2]">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="aspect-square w-full flex items-center justify-center text-4xl bg-[#f0f4ee]">
                        <Package size={40} className="text-[#c5d9be]" />
                      </div>
                    )}
                    {product.isDeal && (
                      <span className="absolute left-2 top-2 rounded-md bg-[#d9f04a] px-2 py-1 text-[10px] font-extrabold text-[#27472f]">DEAL</span>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 text-xs font-bold text-red-500">Out of stock</div>
                    )}
                  </div>
                  <div className="px-1 pb-1 pt-3">
                    <p className="block truncate text-sm font-bold">{product.name}</p>
                    <p className="mt-1 text-xs text-[#819087]">{product.detail || product.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-extrabold">Rs.{product.price}</span>
                        {product.oldPrice ? <del className="ml-1 text-xs text-[#a6afa8]">Rs.{product.oldPrice}</del> : null}
                      </div>
                      {product.stock > 0 && (
                        <button className="rounded-lg border border-[#a9ca83] px-3 py-1.5 text-xs font-extrabold text-[#639443] transition hover:bg-[#eff8e5]">
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Shell>
  )
}