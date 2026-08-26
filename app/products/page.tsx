import React from 'react';
import { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { EnquiryModal } from '@/components/enquiry-modal';
import { ProductCatalog } from '@/components/product-catalog';
import { getDb, initDb, Product, Category } from '@/lib/db';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Engineering Products & Equipment Catalog | SPEC ENGINEERS',
  description: 'Explore our catalog of industrial machinery, precision grinding tooling, turbine components, and custom engineering equipment.',
  openGraph: {
    title: 'Engineering Products Catalog | SPEC ENGINEERS',
    description: 'Precision engineered machinery, tooling, and industrial equipment from SPEC ENGINEERS.',
  },
};

async function getPublishedProducts(): Promise<Product[]> {
  try {
    await initDb();
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT * FROM products WHERE status = 'published' ORDER BY created_at DESC",
    });
    return JSON.parse(JSON.stringify(result.rows)) as Product[];
  } catch (error) {
    console.error('Error fetching published products for public store:', error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    await initDb();
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM categories ORDER BY name ASC',
    });
    return JSON.parse(JSON.stringify(result.rows)) as Category[];
  } catch (error) {
    console.error('Error fetching categories for products page:', error);
    return [];
  }
}

export default async function PublicProductsPage() {
  const [products, categories] = await Promise.all([
    getPublishedProducts(),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-card via-background to-background border-b border-border overflow-hidden">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Precision Industrial Inventory</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              Products & Equipment Catalog
            </h1>
            <p className="text-lg text-foreground/80 mt-4 leading-relaxed">
              Discover our range of precision grinding machinery, custom tooling, industrial automation components, and turbine reconditioning solutions engineered for maximum performance.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Catalog Grid Section with Category Filtering */}
      <section className="py-16 bg-background flex-1">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductCatalog products={products} categories={categories} />
        </div>
      </section>

      <Footer />
      <EnquiryModal />
    </main>
  );
}
