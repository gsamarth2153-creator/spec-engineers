import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { verifyAdminRequest, hashPassword, AdminPermissions } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }

    if (!admin.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only the primary admin can edit team permissions.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { name, password, permissions } = body;

    await initDb();
    const db = getDb();

    // Find the target user
    const checkUser = await db.execute({
      sql: 'SELECT id, email, role, is_super_admin FROM admin_users WHERE id = ?',
      args: [id],
    });

    if (checkUser.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Admin user not found.' }, { status: 404 });
    }

    const targetUser = checkUser.rows[0];
    const isTargetSuperAdmin = targetUser.id === 'admin_root' || targetUser.is_super_admin === 1;

    // Super admin permissions cannot be restricted
    let safePermissions: AdminPermissions;
    if (isTargetSuperAdmin) {
      safePermissions = {
        dashboard: true,
        orders: true,
        orders_edit: true,
        products: true,
        products_edit: true,
        categories: true,
        categories_edit: true,
      };
    } else {
      safePermissions = {
        dashboard: Boolean(permissions?.dashboard),
        orders: Boolean(permissions?.orders),
        orders_edit: permissions?.orders_edit !== undefined ? Boolean(permissions?.orders_edit) : true,
        products: Boolean(permissions?.products),
        products_edit: permissions?.products_edit !== undefined ? Boolean(permissions?.products_edit) : true,
        categories: Boolean(permissions?.categories),
        categories_edit: permissions?.categories_edit !== undefined ? Boolean(permissions?.categories_edit) : true,
      };

      if (!Object.values(safePermissions).some(Boolean)) {
        return NextResponse.json(
          { success: false, message: 'Please grant access to at least one section.' },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();

    if (password && typeof password === 'string' && password.trim().length >= 6) {
      const hashedPassword = await hashPassword(password.trim());
      await db.execute({
        sql: `UPDATE admin_users
              SET name = COALESCE(?, name),
                  password_hash = ?,
                  permissions = ?,
                  updated_at = ?
              WHERE id = ?`,
        args: [
          name?.trim() || null,
          hashedPassword,
          JSON.stringify(safePermissions),
          now,
          id,
        ],
      });
    } else {
      await db.execute({
        sql: `UPDATE admin_users
              SET name = COALESCE(?, name),
                  permissions = ?,
                  updated_at = ?
              WHERE id = ?`,
        args: [
          name?.trim() || null,
          JSON.stringify(safePermissions),
          now,
          id,
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member updated successfully.',
      permissions: safePermissions,
    });
  } catch (error) {
    console.error('Error updating admin member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update team member.' },
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
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }

    if (!admin.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only the primary admin can remove team members.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Safety checks: Cannot delete root admin or self
    if (id === 'admin_root') {
      return NextResponse.json(
        { success: false, message: 'The primary system administrator cannot be deleted.' },
        { status: 400 }
      );
    }

    if (id === admin.userId) {
      return NextResponse.json(
        { success: false, message: 'You cannot delete your own account.' },
        { status: 400 }
      );
    }

    await initDb();
    const db = getDb();

    const targetUser = await db.execute({
      sql: 'SELECT id, is_super_admin FROM admin_users WHERE id = ?',
      args: [id],
    });

    if (targetUser.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Admin user not found.' }, { status: 404 });
    }

    if (targetUser.rows[0].is_super_admin === 1) {
      return NextResponse.json(
        { success: false, message: 'Super administrator accounts cannot be deleted.' },
        { status: 403 }
      );
    }

    await db.execute({
      sql: 'DELETE FROM admin_users WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({
      success: true,
      message: 'Staff member removed successfully.',
    });
  } catch (error) {
    console.error('Error deleting admin member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove team member.' },
      { status: 500 }
    );
  }
}
