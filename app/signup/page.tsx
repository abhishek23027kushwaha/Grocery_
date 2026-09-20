'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, ShoppingBasket, User, Truck, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let roleToBackend = formData.role;
      if (roleToBackend === 'customer') roleToBackend = 'USER';
      if (roleToBackend === 'admin') roleToBackend = 'ADMIN';
      if (roleToBackend === 'delivery') roleToBackend = 'DELIVERY_BOY';

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: roleToBackend })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Store token (you might want to use a more secure method or contexts)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'ADMIN') router.push('/admin');
      else if (data.user.role === 'DELIVERY_BOY') router.push('/delivery');
      else router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { id: 'customer', label: 'Customer', icon: User },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e4f4d3] px-5 py-12 text-[#15251d]">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl sm:p-10">
        <Link href="/" className="flex items-center gap-2 font-extrabold">
          <span className="grid size-10 place-items-center rounded-xl bg-[#d9f04a]">
            <ShoppingBasket size={20} />
          </span>
          grovli.
        </Link>
        <h1 className="mt-10 text-3xl font-extrabold tracking-[-0.05em]">Create your account</h1>
        <p className="mt-2 text-sm text-[#789080]">Create your grovli account and start shopping fresh.</p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-bold">
            Select Role
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = formData.role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r.id })}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs transition-all ${
                      isSelected
                        ? 'border-[#1c4a31] bg-[#1c4a31] text-white'
                        : 'border-[#dfe8dc] hover:border-[#91b959]'
                    }`}
                  >
                    <Icon size={20} />
                    {r.label}
                  </button>
                );
              })}
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm font-bold">
            Full name
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Aarav Sharma"
              className="h-12 rounded-xl border border-[#dfe8dc] px-4 font-normal outline-none focus:border-[#91b959]"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold">
            Email address
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              className="h-12 rounded-xl border border-[#dfe8dc] px-4 font-normal outline-none focus:border-[#91b959]"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold">
            Phone Number
            <input
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="h-12 rounded-xl border border-[#dfe8dc] px-4 font-normal outline-none focus:border-[#91b959]"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold">
            Password
            <input
              required
              minLength={6}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 6 characters"
              className="h-12 rounded-xl border border-[#dfe8dc] px-4 font-normal outline-none focus:border-[#91b959]"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-[#789080]">
            <input required type="checkbox" /> I agree to the terms and privacy policy
          </label>
          <button
            disabled={isLoading}
            className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1c4a31] text-sm font-bold text-white disabled:opacity-70"
          >
            {isLoading ? 'Creating account...' : 'Create account'} <ArrowRight size={16} />
          </button>
        </form>
        <p className="mt-7 text-sm text-[#789080]">
          Already have an account? <Link href="/login" className="font-bold text-[#639443]">Log in</Link>
        </p>
      </div>
    </main>
  );
}
