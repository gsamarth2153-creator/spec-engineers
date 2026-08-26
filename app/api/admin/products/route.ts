import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb, Product } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await initDb();
    const db = getDb();

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const stock_status = url.searchParams.get('stock_status') || '';
    const category = url.searchParams.get('category') || '';
    const featured = url.searchParams.get('featured') || '';

    let sql = 'SELECT * FROM products WHERE 1=1';
    const args: (string | number)[] = [];

    if (search) {
      sql += ' AND (name LIKE ? OR sku LIKE ? OR category_name LIKE ? OR brand LIKE ?)';
      const searchPattern = `%${search}%`;
      args.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      args.push(status);
    }

    if (stock_status && stock_status !== 'all') {
      sql += ' AND stock_status = ?';
      args.push(stock_status);
    }

    if (category && category !== 'all') {
      sql += ' AND category_name = ?';
      args.push(category);
    }

    if (featured === 'true' || featured === '1') {
      sql += ' AND featured = 1';
    }

    sql += ' ORDER BY created_at DESC';

    const productsRes = await db.execute({ sql, args });
    const products = productsRes.rows as unknown as Product[];

    // Fetch gallery images for all returned products
    const formattedProducts = await Promise.all(
      products.map(async (product) => {
        const galleryRes = await db.execute({
          sql: 'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
          args: [product.id],
        });
        const gallery_images = galleryRes.rows.map((r) => r.image_url as string);
        return {
          ...product,
          gallery_images,
        };
      })
    );

    return NextResponse.json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await initDb();
    const db = getDb();
    const body = await req.json();

    const {
      name,
      slug: customSlug,
      sku,
      short_description,
      description,
      category_id,
      category_name,
      subcategory,
      price,
      sale_price,
      stock_quantity = 0,
      stock_status = 'in_stock',
      brand,
      featured = false,
      status = 'draft',
      featured_image,
      specifications,
      features,
      product_url,
      gallery_images = [],
    } = body;

    // Validation
    if (!name || !short_description || !description || !category_name || !featured_image) {
      return NextResponse.json(
        { success: false, message: 'Product name, descriptions, category, and featured image are required.' },
        { status: 400 }
      );
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid non-negative price.' },
        { status: 400 }
      );
    }

    const numericSalePrice = sale_price ? parseFloat(sale_price) : null;

    // Slug generation & validation
    const slug = slugify(customSlug || name);
    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Valid product slug is required.' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existingSlug = await db.execute({
      sql: 'SELECT id FROM products WHERE slug = ?',
      args: [slug],
    });

    if (existingSlug.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: `A product with the slug "${slug}" already exists. Please choose a unique slug.` },
        { status: 400 }
      );
    }

    // Check SKU uniqueness if provided
    if (sku && sku.trim()) {
      const existingSku = await db.execute({
        sql: 'SELECT id FROM products WHERE sku = ?',
        args: [sku.trim()],
      });
      if (existingSku.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: `A product with the SKU "${sku}" already exists.` },
          { status: 400 }
        );
      }
    }

    const id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const now = new Date().toISOString();

    // Insert product
    await db.execute({
      sql: `INSERT INTO products (
        id, name, slug, sku, short_description, description, category_id, category_name, subcategory,
        price, sale_price, stock_quantity, stock_status, brand, featured, status, featured_image,
        specifications, features, product_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        name.trim(),
        slug,
        sku ? sku.trim() : null,
        short_description.trim(),
        description.trim(),
        category_id || null,
        category_name.trim(),
        subcategory ? subcategory.trim() : null,
        numericPrice,
        numericSalePrice,
        parseInt(stock_quantity) || 0,
        stock_status || 'in_stock',
        brand ? brand.trim() : null,
        featured ? 1 : 0,
        status === 'published' ? 'published' : 'draft',
        featured_image,
        specifications ? specifications.trim() : null,
        features ? features.trim() : null,
        product_url ? product_url.trim() : null,
        now,
        now,
      ],
    });

    // Insert gallery images if any
    if (Array.isArray(gallery_images) && gallery_images.length > 0) {
      for (let i = 0; i < gallery_images.length; i++) {
        const imgUrl = gallery_images[i];
        const imgId = 'img_' + Date.now() + '_' + i;
        await db.execute({
          sql: `INSERT INTO product_images (id, product_id, image_url, display_order, created_at) VALUES (?, ?, ?, ?, ?)`,
          args: [imgId, id, imgUrl, i, now],
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Product created successfully.',
      product: { id, name, slug, status },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product.' },
      { status: 500 }
    );
  }
}
