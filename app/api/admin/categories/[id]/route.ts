import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

    const { name, slug: customSlug, description, image_url } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Category name is required.' },
        { status: 400 }
      );
    }

    const slug = slugify(customSlug || name);

    // Check slug collision with other categories
    const slugCheck = await db.execute({
      sql: 'SELECT id FROM categories WHERE slug = ? AND id != ?',
      args: [slug, id],
    });

    if (slugCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: `Another category is already using slug "${slug}".` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    await db.execute({
      sql: `UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ?, updated_at = ? WHERE id = ?`,
      args: [name.trim(), slug, description ? description.trim() : null, image_url || null, now, id],
    });

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully.',
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update category.' },
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

    // Check if category is used by any products
    const productCountRes = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      args: [id],
    });

    const count = Number(productCountRes.rows[0]?.count || 0);

    if (count > 0) {
      // Reassign products category_id to NULL
      await db.execute({
        sql: 'UPDATE products SET category_id = NULL WHERE category_id = ?',
        args: [id],
      });
    }

    // Delete category
    await db.execute({
      sql: 'DELETE FROM categories WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete category.' },
      { status: 500 }
    );
  }
}
