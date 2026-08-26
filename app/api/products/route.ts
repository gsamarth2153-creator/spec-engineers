import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb, Product } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const db = getDb();

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const featured = url.searchParams.get('featured') || '';
    const sort = url.searchParams.get('sort') || 'newest';

    let sql = "SELECT * FROM products WHERE status = 'published'";
    const args: (string | number)[] = [];

    if (search) {
      sql += ' AND (name LIKE ? OR category_name LIKE ? OR brand LIKE ? OR short_description LIKE ? OR sku LIKE ?)';
      const searchPattern = `%${search}%`;
      args.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (category && category !== 'all') {
      sql += ' AND category_name = ?';
      args.push(category);
    }

    if (featured === 'true' || featured === '1') {
      sql += ' AND featured = 1';
    }

    // Sort order
    if (sort === 'price_asc') {
      sql += ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY price DESC';
    } else if (sort === 'name_asc') {
      sql += ' ORDER BY name ASC';
    } else {
      sql += ' ORDER BY created_at DESC';
    }

    const productsRes = await db.execute({ sql, args });
    const products = productsRes.rows as unknown as Product[];

    // Fetch gallery images
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
    console.error('Error fetching public products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products.' },
      { status: 500 }
    );
  }
}
