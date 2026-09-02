'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Send, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Product } from '@/lib/db';
import { OrderModal } from '@/components/order-modal';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const isOutOfStock = product.stock_status === 'out_of_stock' || product.stock_quantity <= 0;

  return (
    <>
      <article className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col group">
        {/* Product Image & Badges */}
        <div className="relative h-60 w-full overflow-hidden bg-muted">
          <img
            src={product.featured_image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-white shadow-md">
              {product.category_name}
            </span>
            {product.featured === 1 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500 text-slate-950 flex items-center gap-1 shadow-md">
                <Star className="w-3.5 h-3.5 fill-current" /> Featured
              </span>
            )}
          </div>
        </div>

        {/* Product Body */}
        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* Brand & SKU */}
            <div className="flex items-center justify-between text-xs text-foreground/60 mb-1.5">
              <span className="font-semibold text-primary">{product.brand || 'SPEC ENGINEERS'}</span>
              {product.sku && <span className="font-mono text-[11px]">SKU: {product.sku}</span>}
            </div>

            {/* Product Title */}
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>

            {/* Short Description */}
            <p className="text-xs text-foreground/75 mt-2 line-clamp-2 leading-relaxed">
              {product.short_description}
            </p>
          </div>

          {/* Stock Footer & Action Buttons */}
          <div className="pt-4 border-t border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              {/* Stock Status Badge */}
              <div>
                {product.stock_status === 'in_stock' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> In Stock
                  </span>
                ) : product.stock_status === 'low_stock' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" /> Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                    <XCircle className="w-3 h-3" /> Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Enquiry Now & View Details */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsOrderModalOpen(true)}
                disabled={isOutOfStock}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm ${
                  isOutOfStock
                    ? 'bg-muted text-foreground/40 border border-border cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Enquiry Now'}</span>
              </button>

              <Link
                href={`/products/${product.slug}`}
                className="w-full py-2.5 px-3 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 flex items-center justify-center gap-1 border border-border transition"
              >
                <span>Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Order Modal */}
      <OrderModal
        product={product}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </>
  );
}
