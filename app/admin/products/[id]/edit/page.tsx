'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  FileEdit,
  Save,
  Star,
  Archive,
} from 'lucide-react';
import { toast } from 'sonner';
import { Category } from '@/lib/db';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'out_of_stock' | 'low_stock'>('in_stock');
  const [brand, setBrand] = useState('SPEC ENGINEERS');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [featured, setFeatured] = useState(false);
  const [productUrl, setProductUrl] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');

  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error('Error loading categories:', err));

    fetch(`/api/admin/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.product) {
          const p = data.product;
          setName(p.name || '');
          setSlug(p.slug || '');
          setSku(p.sku || '');
          setCategoryName(p.category_name || '');
          setCategoryId(p.category_id || '');
          setSubcategory(p.subcategory || '');
          setPrice(p.price ? p.price.toString() : '0');
          setSalePrice(p.sale_price ? p.sale_price.toString() : '');
          setStockQuantity(p.stock_quantity ? p.stock_quantity.toString() : '0');
          setStockStatus(p.stock_status || 'in_stock');
          setBrand(p.brand || 'SPEC ENGINEERS');
          setShortDescription(p.short_description || '');
          setFullDescription(p.description || '');
          setFeatures(p.features || '');
          setSpecifications(p.specifications || '');
          setFeatured(p.featured === 1);
          setProductUrl(p.product_url || '');
          setFeaturedImage(p.featured_image || '');
          setGalleryImages(p.gallery_images || []);
          setStatus(p.status || 'draft');
        } else {
          toast.error(data.message || 'Product not found.');
          router.push('/admin/products');
        }
      })
      .catch((err) => {
        console.error('Error fetching product:', err);
        toast.error('Failed to load product.');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingFeatured(true);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFeaturedImage(data.url);
        toast.success('Featured image updated!');
      } else {
        toast.error(data.message || 'Image upload failed.');
      }
    } catch {
      toast.error('Upload error.');
    } finally {
      setUploadingFeatured(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success) {
          newUrls.push(data.url);
        }
      } catch (err) {
        console.error('Gallery image upload failed:', err);
      }
    }

    if (newUrls.length > 0) {
      setGalleryImages((prev) => [...prev, ...newUrls]);
      toast.success(`Uploaded ${newUrls.length} gallery image(s).`);
    } else {
      toast.error('Failed to upload gallery images.');
    }
    setUploadingGallery(false);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent, targetStatus?: 'draft' | 'published' | 'archived') => {
    e.preventDefault();
    const finalStatus = targetStatus || status;

    if (!name.trim()) {
      toast.error('Product name is required.');
      return;
    }

    if (!price || parseFloat(price) < 0) {
      toast.error('Valid non-negative price is required.');
      return;
    }

    if (!shortDescription.trim() || !fullDescription.trim()) {
      toast.error('Descriptions are required.');
      return;
    }

    if (!featuredImage) {
      toast.error('Featured image is required.');
      return;
    }

    const finalCategoryName = categoryName === 'Other' ? customCategory.trim() : categoryName;
    if (!finalCategoryName) {
      toast.error('Please select or specify a category.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          sku: sku || null,
          short_description: shortDescription,
          description: fullDescription,
          category_id: categoryId || null,
          category_name: finalCategoryName,
          subcategory: subcategory || null,
          price,
          sale_price: salePrice || null,
          stock_quantity: parseInt(stockQuantity) || 0,
          stock_status: stockStatus,
          brand: brand || null,
          featured,
          featured_image: featuredImage,
          gallery_images: galleryImages,
          specifications,
          features,
          product_url: productUrl || null,
          status: finalStatus,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Product updated successfully!');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(data.message || 'Failed to update product.');
      }
    } catch {
      toast.error('Error updating product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <span className="text-sm font-semibold">Loading product details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Edit Product</h1>
            <p className="text-xs text-slate-500 font-mono">ID: {id}</p>
          </div>
        </div>

        {status === 'published' && (
          <Link
            href={`/products/${slug}`}
            target="_blank"
            className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition shadow-sm"
          >
            View Live Product ↗
          </Link>
        )}
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        {/* Card 1: Basic Information */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            {/* Slug */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                URL Slug *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-xs text-slate-400 font-mono">/products/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  required
                  className="w-full pl-24 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
            </div>

            {/* SKU */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                SKU / Model Number
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 transition cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
                <option value="Industrial Machinery">Industrial Machinery</option>
                <option value="Precision Tooling & Grinding">Precision Tooling & Grinding</option>
                <option value="Automation & Robotics">Automation & Robotics</option>
                <option value="Turbine Components">Turbine Components</option>
                <option value="Other">Other (Custom)</option>
              </select>
            </div>

            {categoryName === 'Other' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Custom Category Name *
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
            )}

            {/* Subcategory */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Subcategory
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Pricing & Inventory Stock */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Pricing & Inventory Stock</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Standard Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            {/* Sale Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Discounted Sale Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-emerald-600 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            {/* Stock Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Stock Status
              </label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 transition cursor-pointer"
              >
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Featured Product Checkbox */}
            <div className="md:col-span-2 flex items-center gap-3 pt-6">
              <label className="relative flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 bg-slate-50 text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                />
                <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  Mark as Featured Product
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Card 3: Descriptions, Features & Specifications */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Descriptions & Specifications</h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Short Description *
            </label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Full Product Description *
            </label>
            <textarea
              rows={5}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Key Features (One per line)
              </label>
              <textarea
                rows={4}
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Technical Specifications (Key: Value per line)
              </label>
              <textarea
                rows={4}
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-xs transition"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Featured Image Upload */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Featured Image *</h2>

          {featuredImage ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 max-w-md group">
              <img src={featuredImage} alt="Featured Preview" className="w-full h-56 object-cover bg-slate-100" />
              <button
                type="button"
                onClick={() => setFeaturedImage('')}
                className="absolute top-3 right-3 p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">Replace Featured Image</p>

              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition shadow-md shadow-blue-500/20 mt-3">
                {uploadingFeatured ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{uploadingFeatured ? 'Uploading...' : 'Choose File'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFeaturedImageUpload}
                  disabled={uploadingFeatured}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Card 5: Gallery Images */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Product Gallery</h2>

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer border border-slate-200 transition">
              {uploadingGallery ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Upload className="w-4 h-4 text-blue-600" />}
              <span>{uploadingGallery ? 'Uploading Gallery...' : 'Add More Gallery Images'}</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleGalleryUpload}
                disabled={uploadingGallery}
                className="hidden"
              />
            </label>
            <span className="text-xs font-semibold text-slate-500">{galleryImages.length} image(s) total</span>
          </div>

          {galleryImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {galleryImages.map((imgUrl, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-28 object-cover bg-slate-100" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visibility Status:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatus('published')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                  status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Published
              </button>
              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                  status === 'draft'
                    ? 'bg-amber-50 text-amber-700 border border-amber-300'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setStatus('archived')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                  status === 'archived'
                    ? 'bg-purple-50 text-purple-700 border border-purple-300'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Archived
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/admin/products"
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold transition text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-extrabold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Product Changes</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
