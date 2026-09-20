'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminShell } from '@/components/admin-shell'
import { categories } from '@/lib/store-data'

interface CategoryStat {
  _id: string
  count: number
  totalStock: number
  avgPrice: number
}

const categoryMeta: Record<string, { name: string; image: string; color: string }> = {
  fruits:          { name: 'Fresh Fruits',      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=200&q=70', color: 'bg-yellow-50 border-yellow-200' },
  vegetables:      { name: 'Vegetables',        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=70', color: 'bg-green-50 border-green-200' },
  'dairy-eggs':    { name: 'Dairy & Eggs',      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=200&q=70', color: 'bg-orange-50 border-orange-200' },
  bakery:          { name: 'Bakery',            image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=70', color: 'bg-amber-50 border-amber-200' },
  munchies:        { name: 'Munchies',          image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=200&q=70', color: 'bg-red-50 border-red-200' },
  beverages:       { name: 'Beverages',         image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=200&q=70', color: 'bg-blue-50 border-blue-200' },
  'grocery-kitchen': { name: 'Grocery & Kitchen', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=200&q=70', color: 'bg-purple-50 border-purple-200' },
}

export default function AdminCategoriesPage() {
  const [stats, setStats] = useState<CategoryStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Merge all known categories with DB stats (so even empty ones show)
  const allCategories = Object.entries(categoryMeta).map(([slug, meta]) => {
    const stat = stats.find(s => s._id === slug)
    return { slug, ...meta, count: stat?.count ?? 0, totalStock: stat?.totalStock ?? 0, avgPrice: stat?.avgPrice ?? 0 }
  })

  const totalProducts = stats.reduce((sum, s) => sum + s.count, 0)

  return (
    <AdminShell title="Categories" description="Overview of all product categories and their inventory.">
      {/* Summary bar */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total categories', value: allCategories.length },
          { label: 'Total products', value: totalProducts },
          { label: 'Categories with stock', value: stats.length },
          { label: 'Empty categories', value: allCategories.length - stats.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-[#e5ebe3] bg-white p-4">
            <p className="text-xs text-[#789080]">{label}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">{loading ? '…' : value}</p>
          </div>
        ))}
      </div>

      {/* Category cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {allCategories.map(({ slug, name, image, color, count, totalStock, avgPrice }) => (
          <div key={slug} className={`rounded-2xl border ${color} bg-white overflow-hidden`}>
            <div className="flex items-center gap-4 p-5">
              <img src={image} alt={name} className="size-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h2 className="font-extrabold truncate">{name}</h2>
                <p className="mt-1 text-xs text-[#789080] font-mono">{slug}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${count > 0 ? 'bg-[#e8f5d9] text-[#4f823d]' : 'bg-[#f5f5f5] text-[#aaa]'}`}>
                    {loading ? '…' : count} products
                  </span>
                  {count > 0 && (
                    <span className="inline-flex rounded-full bg-[#f0f8ff] px-2.5 py-1 text-[11px] font-bold text-[#4a6fa8]">
                      {loading ? '…' : totalStock} in stock
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[#edf1eb] px-5 py-3">
              <span className="text-xs text-[#789080]">
                {count > 0 ? `Avg ₹${Math.round(avgPrice)}` : 'No products yet'}
              </span>
              <div className="flex gap-3">
                <a
                  href={`/admin/products?category=${slug}`}
                  className="text-xs font-bold text-[#639443] hover:underline"
                >
                  View products →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
