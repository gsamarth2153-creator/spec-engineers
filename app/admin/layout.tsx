'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Building2,
  Tags,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string>('admin@specengineer.in');
  const [adminName, setAdminName] = useState<string>('Administrator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isLoginPage = pathname === '/admin' || pathname === '/admin/';

  useEffect(() => {
    if (!isLoginPage) {
      fetch('/api/admin/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setAdminEmail(data.user.email);
            setAdminName(data.user.name || 'Admin');
          }
        })
        .catch((err) => console.error('Error loading session:', err));
    }
  }, [isLoginPage]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/admin/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Logged out successfully.');
        router.push('/admin');
        router.refresh();
      } else {
        toast.error('Logout failed.');
      }
    } catch {
      toast.error('Error during logout.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Add Product', href: '/admin/products/new', icon: PlusCircle },
    { label: 'Categories', href: '/admin/categories', icon: Tags },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3.5 bg-white border-b border-slate-200 shadow-sm">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-extrabold text-lg text-blue-600">
          <Building2 className="w-6 h-6" />
          <span>SPEC CMS</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col justify-between z-30 shadow-sm`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-100 hidden md:flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-blue-500/20">
              SE
            </div>
            <div>
              <div className="font-black text-slate-900 tracking-tight leading-none text-base">SPEC ENGINEERS</div>
              <div className="text-[11px] text-blue-600 font-bold tracking-wider uppercase mt-1">
                Admin CMS Panel
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer & Live Website Link */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold transition shadow-sm"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span>View Public Store</span>
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Live</span>
          </Link>

          <div className="flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 border border-blue-200">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate">{adminName}</div>
                <div className="text-[10px] text-slate-500 truncate">{adminEmail}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-slate-50 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
