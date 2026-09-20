'use client';
import { useState, useEffect, Suspense } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchProducts, updateProduct, deleteProduct } from '@/lib/store/features/products/productSlice';
import { Plus, X, Search, Edit2, Trash2 } from 'lucide-react';
import { StatusBadge } from './admin-shell';
import { useSearchParams } from 'next/navigation';

function ProductsManagerInner({ inventory }: { inventory: boolean }) {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.products);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        await dispatch(fetchProducts());
      } catch (error: any) {
        alert('Failed to delete product: ' + (error.message || 'Unknown error'));
      }
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct._id, formData })).unwrap();
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to add product');
        }
      }
      await dispatch(fetchProducts());
      setIsModalOpen(false);
    } catch (error: any) {
      alert('Failed to save product: ' + (error.message || 'Unknown error'));
      console.error(error);
    }
    setLoading(false);
  }

  const displayedItems = items.filter(product => {
    if (categoryFilter && product.category !== categoryFilter) return false;
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#76a54d]">Tuesday, 17 September 2026</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-.04em] md:text-4xl">
            {inventory ? 'Inventory' : 'Products'}
            {categoryFilter && <span className="text-[#789080] text-2xl ml-2">({categoryFilter})</span>}
          </h1>
          <p className="mt-2 text-sm text-[#789080]">{inventory ? 'Monitor stock levels and restock products before they run out.' : 'Manage your grocery catalogue, pricing and availability.'}</p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center gap-2 rounded-xl bg-[#173d2a] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#24583c]">
          <Plus size={16}/> Add new
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e5ebe3] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#edf1eb] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-extrabold">{inventory ? 'Stock levels' : 'All products'}</h2>
            <p className="mt-1 text-xs text-[#789080]">{displayedItems.length} products shown</p>
          </div>
          <input 
            placeholder="Search products" 
            className="rounded-xl border border-[#dfe7dc] px-3 py-2 text-sm outline-none focus:border-[#8dbb68]" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedItems.map((product) => (
            <div key={product._id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e5ebe3] bg-[#fafcf9] transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="relative aspect-video w-full overflow-hidden bg-[#eff3ea]">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase tracking-widest text-[#a6afa8]">No image</div>
                )}
                <div className="absolute left-3 top-3">
                  <StatusBadge status={product.stock > 10 ? 'Active' : product.stock > 0 ? 'Low stock' : 'Out of stock'} />
                </div>
                <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => openEditModal(product)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#173d2a] shadow-sm hover:bg-[#eff3ea]">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow-sm hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-lg font-extrabold tracking-[-.02em] text-[#17271d] line-clamp-1" title={product.name}>
                  {product.name} {product.detail && <span className="text-sm font-normal text-[#789080] ml-1">({product.detail})</span>}
                </h3>
                <p className="mt-1 text-xs text-[#789080] line-clamp-2 flex-1">{product.description || 'No description available for this product.'}</p>
                
                <div className="mt-4 flex items-end justify-between border-t border-[#edf1eb] pt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8db49a]">Price</p>
                    <p className="mt-0.5 text-lg font-extrabold text-[#173d2a]">₹{product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8db49a]">Stock</p>
                    <p className="mt-0.5 font-bold text-[#3f6249]">{product.stock} <span className="text-xs font-semibold text-[#789080]">units</span></p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {displayedItems.length === 0 && status === 'loading' && (
            <div className="col-span-full py-16 text-center text-sm font-bold text-[#789080]">Loading products...</div>
          )}
          {displayedItems.length === 0 && status === 'succeeded' && (
            <div className="col-span-full py-16 text-center text-sm font-bold text-[#789080]">No products found. Add one!</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <div><label className="text-sm font-bold">Name</label><input required name="name" defaultValue={editingProduct?.name} className="mt-1 w-full rounded-lg border border-[#dfe7dc] p-2 outline-none focus:border-[#8dbb68]" /></div>
              <div><label className="text-sm font-bold">Description</label><textarea required name="description" defaultValue={editingProduct?.description} className="mt-1 w-full rounded-lg border border-[#dfe7dc] p-2 outline-none focus:border-[#8dbb68]" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-bold">Price</label><input required type="number" name="price" defaultValue={editingProduct?.price} className="mt-1 w-full rounded-lg border border-[#dfe7dc] p-2 outline-none focus:border-[#8dbb68]" /></div>
                <div><label className="text-sm font-bold">Stock</label><input required type="number" name="stock" defaultValue={editingProduct?.stock} className="mt-1 w-full rounded-lg border border-[#dfe7dc] p-2 outline-none focus:border-[#8dbb68]" /></div>
              </div>
              <div><label className="text-sm font-bold">Unit / Quantity</label><input required name="detail" defaultValue={editingProduct?.detail} placeholder="e.g. 1L, 500g, 1 piece" className="mt-1 w-full rounded-lg border border-[#dfe7dc] p-2 outline-none focus:border-[#8dbb68]" /></div>
              <div><label className="text-sm font-bold">Category</label>
                <select required name="category" className="mt-1 w-full rounded-lg border border-[#dfe7dc] p-2 bg-white outline-none focus:border-[#8dbb68]" defaultValue={editingProduct ? editingProduct.category : (categoryFilter || "")}>
                  <option value="">Select a category</option>
                  <option value="fruits">Fresh Fruits</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="dairy-eggs">Dairy & Eggs</option>
                  <option value="bakery">Bakery</option>
                  <option value="munchies">Munchies</option>
                  <option value="beverages">Beverages</option>
                </select>
              </div>
              <div><label className="text-sm font-bold">Image <span className="font-normal text-[#789080]">(optional)</span></label><input type="file" name="image" accept="image/*" className="mt-1 w-full rounded-lg border border-[#dfe7dc] p-2 outline-none focus:border-[#8dbb68]" /></div>
              <button disabled={loading} className="mt-4 w-full rounded-xl bg-[#173d2a] py-3 font-bold text-white disabled:opacity-50">
                {loading ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Add Product')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function AdminProductsManager({ inventory }: { inventory: boolean }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#789080]">Loading manager...</div>}>
      <ProductsManagerInner inventory={inventory} />
    </Suspense>
  );
}
