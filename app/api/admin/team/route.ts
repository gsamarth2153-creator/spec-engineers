import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { verifyAdminRequest, hashPassword, AdminPermissions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }

    if (!admin.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only the primary admin can manage team members.' },
        { status: 403 }
      );
    }

    await initDb();
    const db = getDb();

    const result = await db.execute(
      'SELECT id, email, name, role, permissions, is_super_admin, created_at, updated_at FROM admin_users ORDER BY is_super_admin DESC, created_at ASC'
    );

    const users = result.rows.map((row) => {
      let perms: AdminPermissions = {
        dashboard: true,
        orders: true,
        orders_edit: true,
        products: true,
        products_edit: true,
        categories: true,
        categories_edit: true,
      };

      if (row.permissions) {
        try {
          const parsed = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions;
          perms = {
            dashboard: Boolean(parsed.dashboard),
            orders: Boolean(parsed.orders),
            orders_edit: parsed.orders_edit !== undefined ? Boolean(parsed.orders_edit) : true,
            products: Boolean(parsed.products),
            products_edit: parsed.products_edit !== undefined ? Boolean(parsed.products_edit) : true,
            categories: Boolean(parsed.categories),
            categories_edit: parsed.categories_edit !== undefined ? Boolean(parsed.categories_edit) : true,
          };
        } catch {}
      }

      return {
        id: row.id,
        email: row.email,
        name: row.name || 'Staff Member',
        role: row.role,
        isSuperAdmin: row.is_super_admin === 1 || row.role === 'super_admin',
        permissions: perms,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error fetching admin team members:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch team members.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }

    if (!admin.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only the primary admin can create team members.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, password, name, permissions } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'A valid email address is required.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = typeof name === 'string' && name.trim() ? name.trim() : cleanEmail.split('@')[0];

    const safePermissions: AdminPermissions = {
      dashboard: Boolean(permissions?.dashboard),
      orders: Boolean(permissions?.orders),
      orders_edit: permissions?.orders_edit !== undefined ? Boolean(permissions?.orders_edit) : true,
      products: Boolean(permissions?.products),
      products_edit: permissions?.products_edit !== undefined ? Boolean(permissions?.products_edit) : true,
      categories: Boolean(permissions?.categories),
      categories_edit: permissions?.categories_edit !== undefined ? Boolean(permissions?.categories_edit) : true,
    };

    // Ensure user has at least one permission
    if (!Object.values(safePermissions).some(Boolean)) {
      return NextResponse.json(
        { success: false, message: 'Please grant access to at least one section.' },
        { status: 400 }
      );
    }

    await initDb();
    const db = getDb();

    // Check if email already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM admin_users WHERE email = ?',
      args: [cleanEmail],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'An admin account with this email already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newUserId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO admin_users (id, email, password_hash, name, role, permissions, is_super_admin, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      args: [
        newUserId,
        cleanEmail,
        hashedPassword,
        cleanName,
        'admin',
        JSON.stringify(safePermissions),
        now,
        now,
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Staff member added successfully.',
      user: {
        id: newUserId,
        email: cleanEmail,
        name: cleanName,
        role: 'admin',
        isSuperAdmin: false,
        permissions: safePermissions,
        createdAt: now,
      },
    });
  } catch (error) {
    console.error('Error creating admin team member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create team member.' },
      { status: 500 }
    );
  }
}
