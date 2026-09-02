'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Product } from '@/lib/db';
import { OrderModal } from '@/components/order-modal';

interface OrderNowButtonProps {
  product: Product;
}

export function OrderNowButton({ product }: OrderNowButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isOutOfStock = product.stock_status === 'out_of_stock' || product.stock_quantity <= 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isOutOfStock}
        className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 transition shadow-lg ${
          isOutOfStock
            ? 'bg-muted text-foreground/40 border border-border cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary/90 shadow-primary/30'
        }`}
      >
        <Send className="w-5 h-5" />
        <span>{isOutOfStock ? 'Currently Out of Stock' : 'ENQUIRY NOW'}</span>
      </button>

      <OrderModal
        product={product}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
