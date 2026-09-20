'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight, Check, MapPin, Package, UserRound, LogOut, Edit2, X, Save, Clock3, Map } from 'lucide-react'
import { Shell, useCart } from '@/components/storefront-shell'

export default function AccountPage() {
  const { cart, update } = useCart()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '' })
  
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', pincode: '', landmark: '' })
  
  const [isSaving, setIsSaving] = useState(false)
  
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const u = JSON.parse(userStr)
      setUser(u)
      setEditForm({ name: u.name || '', phone: u.phone || '' })
      if (u.addresses && u.addresses.length > 0) {
        setAddressForm({
          street: u.addresses[0].street || '',
          city: u.addresses[0].city || '',
          state: u.addresses[0].state || '',
          pincode: u.addresses[0].pincode || '',
          landmark: u.addresses[0].landmark || '',
        })
      }
    } else {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
    window.location.reload()
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, name: editForm.name, phone: editForm.phone })
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        setIsEditingProfile(false)
      } else {
        alert(data.error || 'Failed to update profile')
      }
    } catch (e) {
      alert('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAddress = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: user.id, 
          name: user.name, 
          phone: user.phone, 
          address: addressForm 
        })
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        setIsEditingAddress(false)
      } else {
        alert(data.error || 'Failed to update address')
      }
    } catch (e) {
      alert('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return (
    <Shell cart={cart} update={update}>
      <section className="mx-auto w-full px-5 py-20 lg:px-8 max-w-7xl animate-pulse">
        <div className="h-40 w-full rounded-3xl bg-zinc-200/50 mb-10"></div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 rounded-3xl bg-zinc-200/50"></div>
          <div className="h-64 rounded-3xl bg-zinc-200/50"></div>
        </div>
      </section>
    </Shell>
  )

  const primaryAddress = user.addresses && user.addresses.length > 0 ? user.addresses[0] : null

  return (
    <Shell cart={cart} update={update}>
      <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        
        {/* Profile Header */}
        <div className="relative rounded-[2rem] bg-zinc-950 px-8 py-12 shadow-2xl overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-teal-500 rounded-full mix-blend-screen filter blur-[100px]"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="grid size-24 place-items-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-lg shadow-emerald-500/30">
                <div className="grid size-full place-items-center rounded-full bg-zinc-950 border border-white/10 text-white text-3xl font-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="text-white text-center md:text-left">
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-1">Your Account</p>
                {!isEditingProfile ? (
                  <h1 className="text-4xl font-black tracking-tight">{user.name}</h1>
                ) : (
                  <input 
                    value={editForm.name} 
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="h-10 w-full md:w-64 rounded-xl border border-white/20 bg-white/10 px-4 font-bold text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 backdrop-blur-md"
                    placeholder="Your Name"
                  />
                )}
                <p className="text-zinc-400 mt-2 font-medium">{user.email}</p>
              </div>
            </div>
            
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20 hover:text-rose-400 transition-colors backdrop-blur-md border border-white/10">
              Log out <LogOut size={16} />
            </button>
          </div>
        </div>
        
        {/* Profile Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* PROFILE CARD */}
          <div className="rounded-[2rem] border border-zinc-100 bg-white p-8 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
                  <UserRound size={20} />
                </span>
                <h2 className="text-xl font-black text-zinc-900">Personal Details</h2>
              </div>
              
              {!isEditingProfile ? (
                <button onClick={() => setIsEditingProfile(true)} className="grid size-10 place-items-center rounded-full bg-zinc-50 text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                  <Edit2 size={18} />
                </button>
              ) : (
                <button onClick={() => setIsEditingProfile(false)} className="grid size-10 place-items-center rounded-full bg-zinc-50 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Email Address</p>
                <p className="font-semibold text-zinc-900">{user.email}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Phone Number</p>
                {!isEditingProfile ? (
                  <p className="font-semibold text-zinc-900">{user.phone || 'No phone number added'}</p>
                ) : (
                  <input 
                    value={editForm.phone} 
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-semibold text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="+91 00000 00000"
                  />
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100">
              {isEditingProfile && (
                <button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70"
                >
                  <Save size={18} /> {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              )}
              
              {!isEditingProfile && (
                <Link href="/orders" className="flex w-full items-center justify-between rounded-2xl bg-zinc-50 px-6 py-4 hover:bg-zinc-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Package size={20} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                    <span className="font-bold text-zinc-900">View My Orders</span>
                  </div>
                  <ArrowRight size={18} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>

          {/* ADDRESS CARD */}
          <div className="rounded-[2rem] border border-zinc-100 bg-white p-8 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-full bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
                  <MapPin size={20} />
                </span>
                <h2 className="text-xl font-black text-zinc-900">Delivery Address</h2>
              </div>
              
              {!isEditingAddress ? (
                 <button onClick={() => setIsEditingAddress(true)} className="grid size-10 place-items-center rounded-full bg-zinc-50 text-zinc-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                   <Edit2 size={18} />
                 </button>
              ) : (
                 <button onClick={() => setIsEditingAddress(false)} className="grid size-10 place-items-center rounded-full bg-zinc-50 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                   <X size={18} />
                 </button>
              )}
            </div>

            <div className="flex-1">
              {!isEditingAddress ? (
                primaryAddress ? (
                  <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">Primary</span>
                    </div>
                    <p className="text-zinc-700 leading-relaxed font-medium">
                      {primaryAddress.street}<br/>
                      {primaryAddress.city}, {primaryAddress.state} <span className="font-bold">{primaryAddress.pincode}</span>
                    </p>
                    {primaryAddress.landmark && (
                      <p className="mt-3 flex items-center gap-2 text-sm text-zinc-500 font-medium">
                        <Map size={14} className="text-zinc-400" /> Landmark: {primaryAddress.landmark}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-200 rounded-2xl">
                    <MapPin size={32} className="text-zinc-300 mb-3" />
                    <p className="text-zinc-500 font-medium mb-1">No address saved yet</p>
                    <p className="text-xs text-zinc-400">Add a delivery address to speed up checkout</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Street Address</label>
                    <input 
                      value={addressForm.street} 
                      onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="mt-1 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="e.g. 123 Green Market St"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">City</label>
                      <input 
                        value={addressForm.city} 
                        onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="mt-1 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">State</label>
                      <input 
                        value={addressForm.state} 
                        onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="mt-1 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Pincode</label>
                      <input 
                        value={addressForm.pincode} 
                        onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="mt-1 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="000000"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Landmark</label>
                      <input 
                        value={addressForm.landmark} 
                        onChange={e => setAddressForm({ ...addressForm, landmark: e.target.value })}
                        className="mt-1 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100">
              {!isEditingAddress ? (
                <button onClick={() => setIsEditingAddress(true)} className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-zinc-100 py-3 text-sm font-bold text-zinc-700 hover:border-zinc-200 hover:bg-zinc-50 transition-all">
                  {primaryAddress ? 'Edit Address' : 'Add New Address'}
                </button>
              ) : (
                <button 
                  onClick={handleSaveAddress} 
                  disabled={isSaving || !addressForm.street || !addressForm.city || !addressForm.state || !addressForm.pincode}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70"
                >
                  <Save size={18} /> {isSaving ? 'Saving...' : 'Save Address'}
                </button>
              )}
            </div>
          </div>
          
        </div>
      </section>
    </Shell>
  )
}
