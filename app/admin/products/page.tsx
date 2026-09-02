'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  FileEdit,
  AlertTriangle,
  Star,
  Tags,
  Archive,
} from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/lib/db';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/products?search=${encodeURIComponent(searchTerm)}&status=${statusFilter}&stock_status=${stockFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to load products list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, statusFilter, stockFilter]);

  const handleSetStatus = async (product: Product, newStatus: 'published' | 'draft' | 'archived') => {
    setUpdatingId(product.id);

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Product status updated to ${newStatus.toUpperCase()}`);
        fetchProducts();
      } else {
        toast.error(data.message || 'Failed to update status.');
      }
    } catch {
      toast.error('Error updating status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    const newFeatured = product.featured === 1 ? 0 : 1;
    setUpdatingId(product.id);

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          featured: newFeatured,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(newFeatured === 1 ? 'Marked as Featured' : 'Removed from Featured');
        fetchProducts();
      } else {
        toast.error(data.message || 'Failed to update featured status.');
      }
    } catch {
      toast.error('Error updating featured status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModalId) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${deleteModalId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Product deleted successfully.');
        setProducts((prev) => prev.filter((p) => p.id !== deleteModalId));
        setDeleteModalId(null);
      } else {
        toast.error(data.message || 'Failed to delete product.');
      }
    } catch {
      toast.error('Error deleting product.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-blue-600" />
            <span>Manage Products</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Create, edit, search, and control inventory & pricing for all products.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-200 shadow-sm transition"
          >
            <Tags className="w-4 h-4 text-blue-600" />
            <span>Categories</span>
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

      {/* Controls (Search & Filters) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name, SKU, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 transition cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
            <option value="archived">Archived Only</option>
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 transition cursor-pointer"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-sm font-semibold">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
            <p className="text-base font-bold mb-2 text-slate-900">No products found.</p>
            <p className="text-xs text-slate-500 mb-4">Try adjusting search filters or create a new product.</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.featured_image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200 bg-slate-100 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80';
                          }}
                        />
                        <div>
                          <div className="font-extrabold text-slate-900">{product.name}</div>
                          <div className="text-xs text-slate-500 font-mono">/products/{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-mono text-xs font-semibold">{product.sku || '—'}</td>
                    <td className="py-4 px-4 text-slate-800 font-bold">{product.category_name}</td>
                    <td className="py-4 px-4 font-black text-slate-900 font-mono">
                      ₹{product.price.toLocaleString('en-IN')}
                      {product.sale_price && (
                        <div className="text-xs text-emerald-600 line-through text-slate-400 font-normal">
                          ₹{product.sale_price.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {product.stock_status === 'in_stock' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          In Stock ({product.stock_quantity})
                        </span>
                      ) : product.stock_status === 'low_stock' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Low ({product.stock_quantity})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {product.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Published
                        </span>
                      ) : product.status === 'archived' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Archive className="w-3.5 h-3.5" /> Archived
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <FileEdit className="w-3.5 h-3.5" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        disabled={updatingId === product.id}
                        className={`p-1.5 rounded-lg border transition ${
                          product.featured === 1
                            ? 'bg-yellow-50 text-yellow-600 border-yellow-300'
                            : 'text-slate-400 border-slate-200 hover:text-slate-700'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      {/* Archive / Publish Quick Actions */}
                      {product.status === 'archived' ? (
                        <button
                          onClick={() => handleSetStatus(product, 'published')}
                          disabled={updatingId === product.id}
                          className="inline-flex items-center p-2 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition"
                          title="Restore & Publish Product"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSetStatus(product, 'archived')}
                          disabled={updatingId === product.id}
                          className="inline-flex items-center p-2 rounded-xl text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-purple-200 transition"
                          title="Archive Product"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}

                      {product.status === 'published' && (
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="inline-flex items-center p-2 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 transition"
                          title="View Live Product"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}

                      <button
                        onClick={() => setDeleteModalId(product.id)}
                        className="inline-flex items-center p-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Delete Product?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete this product and remove its associated images from the CMS?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalId(null)}
                disabled={deleteLoading}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold shadow-md shadow-red-600/20 flex items-center gap-2 transition disabled:opacity-50"
              >
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
