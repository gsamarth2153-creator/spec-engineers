'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  User,
  Phone,
  Mail,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '@/lib/db';

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('Pending');
  const [updating, setUpdating] = useState(false);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setSelectedStatus(data.order.status);
      } else {
        toast.error(data.message || 'Order not found.');
        router.push('/admin/orders');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      toast.error('Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Order status updated to ${selectedStatus}`);
        setOrder((prev) => (prev ? { ...prev, status: selectedStatus as any } : null));
      } else {
        toast.error(data.message || 'Failed to update status.');
      }
    } catch {
      toast.error('Error updating order status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <span className="text-sm font-semibold">Loading order details...</span>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 font-mono">{order.order_number}</h1>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Placed on{' '}
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Status Controller Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider">Change Order Status</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Update fulfillment stage for customer tracking.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={handleUpdateStatus}
            disabled={updating || selectedStatus === order.status}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-extrabold shadow-md shadow-blue-500/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Status</span>
          </button>
        </div>
      </div>

      {/* Grid: Customer Info & Product Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-blue-600" />
            <span>Customer & Contact Information</span>
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-500 uppercase font-bold block">Full Name</span>
              <span className="font-extrabold text-slate-900 text-base">{order.customer_name}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold block">Phone</span>
                <span className="font-mono text-slate-800 font-semibold">{order.customer_phone}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold block">Email</span>
                <span className="font-mono text-slate-800 truncate block font-semibold">{order.customer_email}</span>
              </div>
            </div>

            {order.company_name && (
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold block">Company Name</span>
                <span className="font-bold text-slate-800">{order.company_name}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Delivery Address</span>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                <p className="font-bold text-slate-900">{order.address}</p>
                <p>{order.city}, {order.state} - <span className="font-mono font-extrabold text-blue-600">{order.pincode}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Product & Pricing Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>Ordered Product</span>
            </h2>

            {order.items && order.items.length > 0 ? (
              <div className="space-y-4 pt-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {item.featured_image && (
                      <img
                        src={item.featured_image}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-white shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1">{item.product_name}</h3>
                      {item.sku && <p className="text-xs font-mono text-slate-500">SKU: {item.sku}</p>}
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-slate-500 font-mono">
                          ₹{item.unit_price.toLocaleString('en-IN')} × {item.quantity}
                        </span>
                        <span className="font-black text-slate-900 font-mono text-sm">
                          ₹{item.total_price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4">No item details available.</p>
            )}
          </div>

          {/* Subtotal & Total Box */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-sm text-slate-500">
              <span className="font-bold">Subtotal:</span>
              <span className="font-mono font-bold">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-slate-900 pt-1">
              <span>Total Estimated Amount:</span>
              <span className="text-blue-600 font-mono">₹{order.total_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Requirements Card */}
      {order.additional_requirements && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2 shadow-sm">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Additional Technical / Customization Requirements
          </h2>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {order.additional_requirements}
          </div>
        </div>
      )}
    </div>
  );
}
