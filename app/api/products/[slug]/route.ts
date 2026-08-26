import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb, Product } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await initDb();
    const db = getDb();

    // Fetch published product by slug
    const productRes = await db.execute({
      sql: "SELECT * FROM products WHERE slug = ? AND status = 'published'",
      args: [slug],
    });

    if (productRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found or not published.' },
        { status: 404 }
      );
    }

    const product = productRes.rows[0] as unknown as Product;

    // Fetch gallery images
    const galleryRes = await db.execute({
      sql: 'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
      args: [product.id],
    });
    const gallery_images = galleryRes.rows.map((r) => r.image_url as string);

    // Fetch related published products in same category
    const relatedRes = await db.execute({
      sql: "SELECT * FROM products WHERE category_name = ? AND id != ? AND status = 'published' ORDER BY created_at DESC LIMIT 4",
      args: [product.category_name, product.id],
    });
    const related_products = relatedRes.rows as unknown as Product[];

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        gallery_images,
      },
      related_products,
    });
  } catch (error) {
    console.error('Error fetching public product details:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product details.' },
      { status: 500 }
    );
  }
}
