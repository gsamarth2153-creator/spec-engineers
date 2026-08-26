'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  FileEdit,
  AlertTriangle,
  Star,
  Plus,
  ArrowUpRight,
  Loader2,
  ShoppingBag,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  Eye,
} from 'lucide-react';
import { Product, Order } from '@/lib/db';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    outOfStockProducts: 0,
    featuredProducts: 0,
  });

  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });

  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Fetch products
        const prodRes = await fetch('/api/admin/products');
        const prodData = await prodRes.json();

        if (prodData.success && Array.isArray(prodData.products)) {
          const products: Product[] = prodData.products;
          setRecentProducts(products.slice(0, 5));
          setStats({
            totalProducts: products.length,
            publishedProducts: products.filter((p) => p.status === 'published').length,
            draftProducts: products.filter((p) => p.status === 'draft').length,
            outOfStockProducts: products.filter((p) => p.stock_status === 'out_of_stock').length,
            featuredProducts: products.filter((p) => p.featured === 1).length,
          });
        }

        // Fetch orders
        const orderRes = await fetch('/api/admin/orders');
        const orderData = await orderRes.json();

        if (orderData.success && Array.isArray(orderData.orders)) {
          const orders: Order[] = orderData.orders;
          setRecentOrders(orders.slice(0, 5));
          setOrderStats({
            totalOrders: orders.length,
            pendingOrders: orders.filter((o) => o.status === 'Pending').length,
            confirmedOrders: orders.filter((o) => o.status === 'Confirmed').length,
            processingOrders: orders.filter((o) => o.status === 'Processing').length,
            deliveredOrders: orders.filter((o) => o.status === 'Delivered').length,
            cancelledOrders: orders.filter((o) => o.status === 'Cancelled').length,
          });
        }
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <span className="text-sm font-semibold">Loading CMS Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Real-time analytics for products, inventory stock, and customer orders.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-200 shadow-sm transition"
          >
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span>Manage Orders ({orderStats.pendingOrders} Pending)</span>
          </Link>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-md shadow-blue-500/20 transition duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1: ORDER STATISTICS */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Order Analytics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
            <div className="text-xs text-slate-500 font-bold">Total Orders</div>
            <div className="text-2xl font-black text-slate-900">{orderStats.totalOrders}</div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
            <div className="text-xs text-amber-700 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Pending
            </div>
            <div className="text-2xl font-black text-amber-800">{orderStats.pendingOrders}</div>
          </div>

          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
            <div className="text-xs text-blue-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
            </div>
            <div className="text-2xl font-black text-blue-800">{orderStats.confirmedOrders}</div>
          </div>

          <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
            <div className="text-xs text-purple-700 font-bold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Processing
            </div>
            <div className="text-2xl font-black text-purple-800">{orderStats.processingOrders}</div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
            <div className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <PackageCheck className="w-3.5 h-3.5" /> Delivered
            </div>
            <div className="text-2xl font-black text-emerald-800">{orderStats.deliveredOrders}</div>
          </div>

          <div className="bg-red-50/60 border border-red-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
            <div className="text-xs text-red-700 font-bold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Cancelled
            </div>
            <div className="text-2xl font-black text-red-800">{orderStats.cancelledOrders}</div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PRODUCT STATISTICS */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Product Portfolio Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.totalProducts}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-bold uppercase tracking-wider">Published</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-600">{stats.publishedProducts}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-xs font-bold uppercase tracking-wider">Drafts</span>
              <FileEdit className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-amber-600">{stats.draftProducts}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-red-600">
              <span className="text-xs font-bold uppercase tracking-wider">Out of Stock</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-black text-red-600">{stats.outOfStockProducts}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-yellow-600">
              <span className="text-xs font-bold uppercase tracking-wider">Featured</span>
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
            </div>
            <div className="text-3xl font-black text-yellow-600">{stats.featuredProducts}</div>
          </div>
        </div>
      </div>

      {/* SECTION 3: TABLES (Recent Orders & Recent Products) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <span>Recent Orders</span>
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              <span>View All ({orderStats.totalOrders})</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No order requests received yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-3">Order #</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-blue-600">{order.order_number}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 truncate max-w-[120px]">
                        {order.customer_name}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900 font-mono">
                        ₹{order.total_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg inline-block transition"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Products Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span>Recently Added Products</span>
            </h2>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              <span>View All ({stats.totalProducts})</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No products created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Stock</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-bold text-slate-900 truncate max-w-[160px]">
                        {product.name}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900 font-mono">
                        ₹{product.price.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        {product.stock_quantity}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {product.status === 'published' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Published
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                            Draft
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
