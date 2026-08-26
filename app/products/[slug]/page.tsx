import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { EnquiryModal } from '@/components/enquiry-modal';
import { ProductCard } from '@/components/product-card';
import { OrderNowButton } from '@/components/order-now-button';
import { getDb, initDb, Product } from '@/lib/db';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Star,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProductBySlug(slug: string): Promise<{ product: Product | null; related: Product[] }> {
  try {
    await initDb();
    const db = getDb();

    // Fetch published product by slug
    const result = await db.execute({
      sql: "SELECT * FROM products WHERE slug = ? AND status = 'published'",
      args: [slug],
    });

    if (result.rows.length === 0) {
      return { product: null, related: [] };
    }

    const product = JSON.parse(JSON.stringify(result.rows[0])) as Product;

    // Fetch gallery images
    const galleryRes = await db.execute({
      sql: 'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
      args: [product.id],
    });
    const gallery_images = galleryRes.rows.map((r) => r.image_url as string);

    // Fetch related published products in same category
    const relatedRes = await db.execute({
      sql: "SELECT * FROM products WHERE category_name = ? AND id != ? AND status = 'published' ORDER BY created_at DESC LIMIT 3",
      args: [product.category_name, product.id],
    });
    const related = JSON.parse(JSON.stringify(relatedRes.rows)) as Product[];

    return {
      product: {
        ...product,
        gallery_images,
      },
      related,
    };
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return { product: null, related: [] };
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | SPEC ENGINEERS',
    };
  }

  return {
    title: `${product.name} | SPEC ENGINEERS Products`,
    description: product.short_description,
    openGraph: {
      title: `${product.name} | SPEC ENGINEERS`,
      description: product.short_description,
      images: [
        {
          url: product.featured_image,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function PublicProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { product, related } = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.sale_price || 0)) / product.price) * 100)
    : 0;

  // Format specifications lines
  const specLines = product.specifications
    ? product.specifications.split('\n').filter((line) => line.trim().length > 0)
    : [];

  // Format features lines
  const featureLines = product.features
    ? product.features.split('\n').filter((line) => line.trim().length > 0)
    : [];

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      {/* Top Breadcrumb Navigation */}
      <section className="bg-card border-b border-border py-4">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Products</span>
          </Link>
        </div>
      </section>

      {/* Main Product Overview */}
      <section className="py-12 md:py-16 bg-background flex-1">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Main Grid: Images + Product Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-xl h-[420px]">
                <img
                  src={product.featured_image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.featured === 1 && (
                  <div className="absolute top-4 left-4 bg-yellow-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-current" /> Featured Product
                  </div>
                )}
                {hasDiscount && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                    {discountPercent}% OFF
                  </div>
                )}
              </div>

              {/* Gallery Thumbnails */}
              {product.gallery_images && product.gallery_images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-xl overflow-hidden border-2 border-primary h-20 bg-card">
                    <img src={product.featured_image} alt="Main" className="w-full h-full object-cover" />
                  </div>
                  {product.gallery_images.map((imgUrl, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-border h-20 bg-card">
                      <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta & Pricing Box */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-white">
                    {product.category_name}
                  </span>
                  {product.brand && (
                    <span className="text-xs font-semibold text-foreground/60 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-primary" /> {product.brand}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                  {product.name}
                </h1>

                {product.sku && (
                  <p className="text-xs text-foreground/60 font-mono mt-2">
                    Model / SKU: <span className="font-bold text-foreground">{product.sku}</span>
                  </p>
                )}
              </div>

              {/* Price & Stock Banner */}
              <div className="p-6 rounded-2xl bg-card border border-border space-y-5 shadow-sm">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wider block mb-1">
                      Price
                    </span>
                    {hasDiscount ? (
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black text-foreground">
                          ₹{product.sale_price?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-base text-foreground/50 line-through">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-3xl font-black text-foreground">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div>
                    {product.stock_status === 'in_stock' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> In Stock ({product.stock_quantity})
                      </span>
                    ) : product.stock_status === 'low_stock' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="w-4 h-4" /> Low Stock ({product.stock_quantity})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        <XCircle className="w-4 h-4" /> Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed pt-2 border-t border-border/60">
                  {product.short_description}
                </p>

                {/* ORDER NOW BUTTON */}
                <div className="pt-2">
                  <OrderNowButton product={product} />
                </div>

                {product.product_url && (
                  <div className="pt-2">
                    <a
                      href={product.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>External Documentation Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Description & Specifications Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Full Description */}
            <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground">Detailed Description</h2>
              <div className="prose dark:prose-invert max-w-none text-foreground/80 leading-relaxed space-y-4 whitespace-pre-wrap">
                {product.description}
              </div>

              {/* Features List */}
              {featureLines.length > 0 && (
                <div className="pt-6 border-t border-border space-y-4">
                  <h3 className="text-lg font-bold text-foreground">Key Product Features</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-foreground/80">
                    {featureLines.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feat.replace(/^•\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Specifications Box */}
            <div className="bg-card border border-border rounded-3xl p-8 space-y-5 shadow-sm">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-3">
                Technical Specifications
              </h2>

              {specLines.length > 0 ? (
                <div className="space-y-3 font-mono text-xs">
                  {specLines.map((spec, idx) => {
                    const parts = spec.split(':');
                    const label = parts[0];
                    const value = parts.slice(1).join(':');
                    return (
                      <div key={idx} className="flex justify-between py-2 border-b border-border/60">
                        <span className="text-foreground/60 font-semibold">{label}</span>
                        <span className="font-bold text-foreground">{value || '—'}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-foreground/60">Standard industrial specifications available upon request.</p>
              )}
            </div>
          </div>

          {/* Related Products Section */}
          {related.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-border">
              <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {related.map((relProduct) => (
                  <ProductCard key={relProduct.id} product={relProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <EnquiryModal />
    </main>
  );
}
