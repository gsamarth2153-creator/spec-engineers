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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await initDb();
    const db = getDb();

    const productRes = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    });

    if (productRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found.' },
        { status: 404 }
      );
    }

    const product = productRes.rows[0] as unknown as Product;

    const galleryRes = await db.execute({
      sql: 'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
      args: [id],
    });
    const gallery_images = galleryRes.rows.map((r) => r.image_url as string);

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        gallery_images,
      },
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
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

    // Check product existence
    const existingProd = await db.execute({
      sql: 'SELECT id FROM products WHERE id = ?',
      args: [id],
    });

    if (existingProd.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found.' },
        { status: 404 }
      );
    }

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

    const slug = slugify(customSlug || name);
    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Valid product slug is required.' },
        { status: 400 }
      );
    }

    // Check slug collision with other products
    const slugCheck = await db.execute({
      sql: 'SELECT id FROM products WHERE slug = ? AND id != ?',
      args: [slug, id],
    });

    if (slugCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: `Another product is already using the slug "${slug}".` },
        { status: 400 }
      );
    }

    // Check SKU collision with other products
    if (sku && sku.trim()) {
      const skuCheck = await db.execute({
        sql: 'SELECT id FROM products WHERE sku = ? AND id != ?',
        args: [sku.trim(), id],
      });
      if (skuCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: `Another product is already using the SKU "${sku}".` },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();

    // Update product details
    await db.execute({
      sql: `UPDATE products SET
        name = ?,
        slug = ?,
        sku = ?,
        short_description = ?,
        description = ?,
        category_id = ?,
        category_name = ?,
        subcategory = ?,
        price = ?,
        sale_price = ?,
        stock_quantity = ?,
        stock_status = ?,
        brand = ?,
        featured = ?,
        status = ?,
        featured_image = ?,
        specifications = ?,
        features = ?,
        product_url = ?,
        updated_at = ?
      WHERE id = ?`,
      args: [
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
        status === 'published' ? 'published' : status === 'archived' ? 'archived' : 'draft',
        featured_image,
        specifications ? specifications.trim() : null,
        features ? features.trim() : null,
        product_url ? product_url.trim() : null,
        now,
        id,
      ],
    });

    // Update gallery images
    await db.execute({
      sql: 'DELETE FROM product_images WHERE product_id = ?',
      args: [id],
    });

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
      message: 'Product updated successfully.',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await initDb();
    const db = getDb();

    // Check product existence
    const existingProd = await db.execute({
      sql: 'SELECT id FROM products WHERE id = ?',
      args: [id],
    });

    if (existingProd.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found.' },
        { status: 404 }
      );
    }

    // Delete associated gallery images
    await db.execute({
      sql: 'DELETE FROM product_images WHERE product_id = ?',
      args: [id],
    });

    // Delete product
    await db.execute({
      sql: 'DELETE FROM products WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product.' },
      { status: 500 }
    );
  }
}
