import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb, Category } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  try {
    await initDb();
    const db = getDb();

    const categoriesRes = await db.execute({
      sql: 'SELECT * FROM categories ORDER BY name ASC',
    });

    const categories = categoriesRes.rows as unknown as Category[];

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories.' },
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

    const { name, slug: customSlug, description, image_url } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Category name is required.' },
        { status: 400 }
      );
    }

    const slug = slugify(customSlug || name);

    // Check slug uniqueness
    const existing = await db.execute({
      sql: 'SELECT id FROM categories WHERE slug = ?',
      args: [slug],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: `Category slug "${slug}" already exists.` },
        { status: 400 }
      );
    }

    const id = 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO categories (id, name, slug, description, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, name.trim(), slug, description ? description.trim() : null, image_url || null, now, now],
    });

    return NextResponse.json({
      success: true,
      message: 'Category created successfully.',
      category: { id, name: name.trim(), slug },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create category.' },
      { status: 500 }
    );
  }
}
