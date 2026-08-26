'use client';

import React, { useState, useMemo } from 'react';
import { Product, Category } from '@/lib/db';
import { ProductCard } from '@/components/product-card';
import { Package, Search, Filter, Layers, Check } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
}

export function ProductCatalog({ products, categories }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract all unique category options
  const categoryOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number; description?: string }>();

    // Register categories from database
    categories.forEach((cat) => {
      map.set(cat.name.toLowerCase(), {
        id: cat.id,
        name: cat.name,
        count: 0,
        description: cat.description || undefined,
      });
    });

    // Count products per category
    products.forEach((prod) => {
      const catName = prod.category_name || 'Uncategorized';
      const key = catName.toLowerCase();
      if (map.has(key)) {
        map.get(key)!.count += 1;
      } else {
        map.set(key, {
          id: prod.category_id || key,
          name: catName,
          count: 1,
        });
      }
    });

    return Array.from(map.values()).filter((c) => c.count > 0 || categories.some(cat => cat.name.toLowerCase() === c.name.toLowerCase()));
  }, [products, categories]);

  // Filter products by selected category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        product.category_name?.toLowerCase() === selectedCategory.toLowerCase() ||
        product.category_id === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        (product.category_name && product.category_name.toLowerCase().includes(q)) ||
        (product.short_description && product.short_description.toLowerCase().includes(q)) ||
        (product.sku && product.sku.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const activeCategoryObj = categoryOptions.find(
    (c) => c.name.toLowerCase() === selectedCategory.toLowerCase() || c.id === selectedCategory
  );

  return (
    <div className="space-y-8">
      {/* Search Bar & Product Counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, models, or categories..."
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-foreground/40 transition"
          />
        </div>

        <div className="text-xs text-foreground/60 font-medium flex items-center gap-1.5 self-end md:self-auto">
          <Layers className="w-4 h-4 text-primary" />
          <span>Showing <strong className="text-foreground">{filteredProducts.length}</strong> of {products.length} Products</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-primary" />
          <span>Filter By Category</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
              selectedCategory === 'all'
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                : 'bg-card text-foreground hover:bg-muted border-border'
            }`}
          >
            <span>All Products</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-muted text-foreground/70'
              }`}
            >
              {products.length}
            </span>
          </button>

          {categoryOptions.map((cat) => {
            const isSelected =
              selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
              selectedCategory === cat.id;

            return (
              <button
                key={cat.id || cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                    : 'bg-card text-foreground hover:bg-muted border-border'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-muted text-foreground/70'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Description Banner */}
      {selectedCategory !== 'all' && activeCategoryObj?.description && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-xs text-foreground/80 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm">{activeCategoryObj.name}</h4>
            <p className="mt-0.5">{activeCategoryObj.description}</p>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-3xl p-8 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No Products Found</h3>
          <p className="text-sm text-foreground/70 mt-2">
            No equipment or products match your selected category or search filters. Try selecting another category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-5 px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-md"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
