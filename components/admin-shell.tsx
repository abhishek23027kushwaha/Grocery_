'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Boxes, ChartNoAxesCombined, ChevronDown, IndianRupee, LayoutDashboard, LogOut, Menu, Package, PanelLeft, Plus, Search, Settings, ShoppingBag, Tags, TicketPercent, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { adminNav, statusTone } from '@/lib/admin-data'
const icons = { LayoutDashboard, ShoppingBag, Package, Tags, Boxes, Users, TicketPercent }
export function AdminShell({ children, title, description, action }: { children: React.ReactNode; title: string; description: string; action?: React.ReactNode }) { 
  const pathname = usePathname(); 
  const router = useRouter(); 
  const [open, setOpen] = useState(false); 
  const [userName, setUserName] = useState('Admin'); 
  const [userInitial, setUserInitial] = useState('A'); 
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => { 
    try { 
      const userStr = localStorage.getItem('user'); 
      if (userStr) { 
        const user = JSON.parse(userStr); 
        if (user?.role !== 'ADMIN' && user?.role !== 'admin') { 
          router.push('/'); 
          return; 
        } 
        if (user?.name) { 
          setUserName(user.name); 
          setUserInitial(user.name.charAt(0).toUpperCase()); 
        } 
        setIsAuthorized(true);
      } else { 
        router.push('/login'); 
      } 
    } catch(e){} 
  }, [router]); 

  if (!isAuthorized) return null;

  return <div className="min-h-screen bg-[#f7f8f4] text-[#17271d]">{open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}<aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#e5ebe3] bg-[#173d2a] p-5 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex items-center justify-between"><Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-[-.04em]"><span className="grid size-9 place-items-center rounded-xl bg-[#d9f04a] text-[#173423]">g.</span>grovli<span className="text-[#d9f04a]">.</span></Link><button onClick={() => setOpen(false)} className="lg:hidden"><X size={20}/></button></div><p className="mb-3 mt-10 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#8db49a]">Workspace</p><nav className="flex flex-col gap-1">{adminNav.map((item) => { const Icon = icons[item.icon as keyof typeof icons]; const active = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href); return <Link onClick={() => setOpen(false)} key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-[#d9f04a] text-[#173423]' : 'text-[#c7ddcc] hover:bg-white/10'}`}><Icon size={18}/>{item.label}</Link> })}</nav><div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4"><Link href="/account" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#c7ddcc] hover:bg-white/10"><Settings size={18}/>Settings</Link><Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#c7ddcc] hover:bg-white/10"><LogOut size={18}/>View storefront</Link></div></aside><div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e5ebe3] bg-[#fbfcf9]/90 px-5 backdrop-blur md:px-8"><button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-white lg:hidden"><Menu size={21}/></button><div className="hidden items-center gap-3 text-sm text-[#79907e] md:flex"><Search size={18}/><span>Search anything...</span></div><div className="ml-auto flex items-center gap-4"><button className="relative rounded-lg p-2 text-[#62796a] hover:bg-white"><Bell size={19}/><span className="absolute right-1 top-1 size-2 rounded-full bg-[#e66b50]"/></button><div className="flex items-center gap-2 border-l border-[#e5ebe3] pl-4"><div className="grid size-8 place-items-center rounded-full bg-[#d9f04a] text-xs font-extrabold text-[#173423]">{userInitial}</div><span className="hidden text-sm font-bold sm:block">{userName}</span><ChevronDown size={15}/></div></div></header><main className="mx-auto max-w-[1480px] p-5 md:p-8">{title ? <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#76a54d]">Tuesday, 17 September 2026</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.04em] md:text-4xl">{title}</h1><p className="mt-2 text-sm text-[#789080]">{description}</p></div>{action}</div> : null}{children}</main></div></div> }
export function StatusBadge({ status }: { status: string }) { 
  const formatted = status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  let tone = 'bg-[#e8f0ff] text-[#5577b8]';
  if (['Delivered', 'Active'].includes(formatted)) tone = 'bg-[#e7f5dc] text-[#4d873e]';
  if (['Out Of Stock', 'Cancelled'].includes(formatted)) tone = 'bg-[#fde8e5] text-[#c45a4d]';
  if (['Low Stock', 'Pending'].includes(formatted)) tone = 'bg-[#fff0d5] text-[#ad741c]';
  
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>{formatted}</span> 
}
export function AdminButton({ children = 'Add new', href = '#' }: { children?: React.ReactNode; href?: string }) { return <Link href={href} className="inline-flex items-center gap-2 rounded-xl bg-[#173d2a] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#24583c]"><Plus size={16}/>{children}</Link> }
export function EmptyAdminPage({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <div className="rounded-2xl border border-dashed border-[#d8e1d5] bg-white px-6 py-16 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#eff7e6] text-[#71a344]"><Boxes size={22}/></div><h2 className="mt-4 text-lg font-extrabold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#789080]">{description}</p><div className="mt-5">{action}</div></div> }
export { IndianRupee, ShoppingBag, Users, ChartNoAxesCombined, Package, Tags, TicketPercent }
