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
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserPermissions {
  dashboard: boolean;
  orders: boolean;
  orders_edit?: boolean;
  products: boolean;
  products_edit?: boolean;
  categories: boolean;
  categories_edit?: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string>('admin@specengineer.in');
  const [adminName, setAdminName] = useState<string>('Administrator');
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(true);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    dashboard: true,
    orders: true,
    orders_edit: true,
    products: true,
    products_edit: true,
    categories: true,
    categories_edit: true,
  });
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
            setIsSuperAdmin(Boolean(data.user.isSuperAdmin));
            if (data.user.permissions) {
              setUserPermissions(data.user.permissions);
            }
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
    ...(isSuperAdmin || userPermissions.dashboard !== false
      ? [{ label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }]
      : []),
    ...(isSuperAdmin || userPermissions.orders !== false
      ? [{ label: 'Orders', href: '/admin/orders', icon: ShoppingBag }]
      : []),
    ...(isSuperAdmin || userPermissions.products !== false
      ? [
          { label: 'Products', href: '/admin/products', icon: Package },
          ...(isSuperAdmin || userPermissions.products_edit !== false
            ? [{ label: 'Add Product', href: '/admin/products/new', icon: PlusCircle }]
            : []),
        ]
      : []),
    ...(isSuperAdmin || userPermissions.categories !== false
      ? [{ label: 'Categories', href: '/admin/categories', icon: Tags }]
      : []),
    ...(isSuperAdmin
      ? [{ label: 'Team & Access', href: '/admin/team', icon: Users }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Mobile Sticky Top Header */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shadow-blue-500/30">
            SE
          </div>
          <div>
            <div className="font-black text-slate-900 tracking-tight leading-none text-sm">SPEC ENGINEERS</div>
            <div className="text-[9px] text-blue-600 font-bold tracking-wider uppercase mt-0.5">Admin CMS</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition"
            title="View Store"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Slide-in Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                    SE
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-sm leading-tight">SPEC ENGINEERS</div>
                    <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Control Center</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="p-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span>Public Website</span>
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Live</span>
              </Link>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-slate-900 truncate">{adminName}</div>
                    <div className="text-[10px] text-blue-600 font-semibold truncate">
                      {isSuperAdmin ? 'Primary Admin' : 'Staff Member'}
                    </div>
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
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-shrink-0 flex-col justify-between z-30 shadow-xs h-screen sticky top-0">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
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
              const isActive =
                pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold transition shadow-xs"
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
                <div className="text-[10px] text-blue-600 font-semibold truncate">
                  {isSuperAdmin ? 'Primary Admin' : 'Staff Member'}
                </div>
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
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto bg-slate-50 max-w-7xl mx-auto w-full pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Quick Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-around">
        {(isSuperAdmin || userPermissions.dashboard !== false) && (
          <Link
            href="/admin/dashboard"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
              pathname === '/admin/dashboard' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Overview</span>
          </Link>
        )}

        {(isSuperAdmin || userPermissions.orders !== false) && (
          <Link
            href="/admin/orders"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
              pathname.startsWith('/admin/orders') ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Orders</span>
          </Link>
        )}

        {/* Center elevated + Add Product action */}
        {(isSuperAdmin || (userPermissions.products !== false && userPermissions.products_edit !== false)) && (
          <Link
            href="/admin/products/new"
            className="flex flex-col items-center -mt-4 group"
            title="Add New Product"
          >
            <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-active:scale-95 transition">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 mt-0.5">Add</span>
          </Link>
        )}

        {(isSuperAdmin || userPermissions.products !== false) && (
          <Link
            href="/admin/products"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
              pathname === '/admin/products' || (pathname.startsWith('/admin/products') && !pathname.includes('/new'))
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Products</span>
          </Link>
        )}

        {isSuperAdmin && (
          <Link
            href="/admin/team"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
              pathname.startsWith('/admin/team') ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Team</span>
          </Link>
        )}

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-900 transition"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>
    </div>
  );
}
