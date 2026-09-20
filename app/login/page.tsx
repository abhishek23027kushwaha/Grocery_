'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, ShoppingBasket } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to log in');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'ADMIN' || data.user.role === 'admin') router.push('/admin');
      else if (data.user.role === 'DELIVERY_BOY' || data.user.role === 'delivery') router.push('/delivery');
      else router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#fbfbf8] text-[#15251d] lg:grid-cols-2">
      <div className="hidden bg-[#e4f4d3] p-12 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold">
          <span className="grid size-10 place-items-center rounded-xl bg-[#d9f04a]">
            <ShoppingBasket size={20} />
          </span>
          grovli.
        </Link>
        <div>
          <p className="text-sm font-bold text-[#51723d]">Freshness, delivered.</p>
          <h1 className="mt-3 max-w-md text-6xl font-extrabold leading-none tracking-[-0.06em]">
            Your pantry is closer than you think.
          </h1>
        </div>
        <p className="text-sm text-[#789080]">Fast delivery. Fresh picks. Better everyday shopping.</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="text-sm font-bold text-[#639443]">← Back to grovli</Link>
          <h1 className="mt-12 text-4xl font-extrabold tracking-[-0.05em]">Welcome back</h1>
          <p className="mt-3 text-[#789080]">Sign in to see your orders and saved addresses.</p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-bold">
              Email address
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="h-12 rounded-xl border border-[#dfe8dc] bg-white px-4 font-normal outline-none focus:border-[#91b959]"
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
                className="h-12 rounded-xl border border-[#dfe8dc] bg-white px-4 font-normal outline-none focus:border-[#91b959]"
              />
            </label>
            <button
              disabled={isLoading}
              className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1c4a31] text-sm font-bold text-white disabled:opacity-70"
            >
              {isLoading ? 'Logging in...' : 'Log in'} <ArrowRight size={16} />
            </button>
          </form>
          <p className="mt-7 text-sm text-[#789080]">
            New to grovli? <Link href="/signup" className="font-bold text-[#639443]">Create an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
