'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  Eye,
  Loader2,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '@/lib/db';

let cachedOrders: Order[] = [];
let hasCachedOrders = false;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(cachedOrders);
  const [loading, setLoading] = useState(!hasCachedOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      const url = `/api/admin/orders?search=${encodeURIComponent(searchTerm)}&status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        if (!searchTerm && statusFilter === 'all') {
          cachedOrders = data.orders;
          hasCachedOrders = true;
        }
      }
    } catch (err) {
      console.error('Error loading admin orders:', err);
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isDefaultFilter = !searchTerm && statusFilter === 'all';
    fetchOrders(isDefaultFilter && hasCachedOrders);
  }, [searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <AlertCircle className="w-3.5 h-3.5" /> Processing
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PackageCheck className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return <span className="text-xs text-slate-500 font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            <span>Customer Orders</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Review incoming order requests, manage status progression, and access buyer details.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order #, Name, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 transition cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="all">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-sm font-semibold">Loading order requests...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
            <p className="text-base font-bold mb-1 text-slate-900">No orders found.</p>
            <p className="text-xs text-slate-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or status filter.'
                : 'Customer order requests will appear here when submitted from the website.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View: High-density interactive cards */}
            <div className="md:hidden space-y-3.5">
              {orders.map((order) => {
                const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                const totalItemCount = order.items ? order.items.reduce((acc, i) => acc + i.quantity, 0) : 0;

                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 transition shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="font-mono font-bold text-sm text-blue-600">
                          {order.order_number}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Customer:</span>
                        <span className="font-extrabold text-slate-900">{order.customer_name}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Contact:</span>
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="font-mono text-blue-600 font-bold hover:underline"
                        >
                          {order.customer_phone}
                        </a>
                      </div>

                      {firstItem && (
                        <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-50">
                          <span className="text-slate-500 font-medium shrink-0">Item:</span>
                          <span className="font-semibold text-slate-800 text-right line-clamp-1">
                            {firstItem.product_name} ({totalItemCount} pcs)
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                        <span className="text-slate-500 font-bold uppercase text-[10px]">Total Amount:</span>
                        <span className="font-black text-slate-900 font-mono text-base">
                          ₹{order.total_amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-extrabold transition shadow-2xs"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Full Order Details</span>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full data table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Order #</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Ordered Item</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-4 font-mono font-bold text-blue-600">{order.order_number}</td>
                        <td className="py-4 px-4">
                          <div className="font-extrabold text-slate-900">{order.customer_name}</div>
                          <div className="text-xs text-slate-500">{order.customer_phone}</div>
                        </td>
                        <td className="py-4 px-4">
                          {firstItem ? (
                            <div>
                              <div className="font-bold text-slate-800 line-clamp-1">{firstItem.product_name}</div>
                              <div className="text-xs text-slate-500 font-mono">Qty: {firstItem.quantity} unit(s)</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-black text-slate-900 font-mono">
                          ₹{order.total_amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500 font-medium">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
