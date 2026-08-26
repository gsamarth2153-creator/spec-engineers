import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb, Order, OrderItem } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized access.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await initDb();
    const db = getDb();

    const orderRes = await db.execute({
      sql: 'SELECT * FROM orders WHERE id = ?',
      args: [id],
    });

    if (orderRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    const order = orderRes.rows[0] as unknown as Order;

    const itemsRes = await db.execute({
      sql: `SELECT oi.*, p.featured_image
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?`,
      args: [id],
    });

    order.items = itemsRes.rows as unknown as OrderItem[];

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json({ success: false, message: 'Server error fetching order.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized access.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await initDb();
    const db = getDb();
    const body = await req.json();
    const { status } = body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid order status specified.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const result = await db.execute({
      sql: 'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?',
      args: [status, now, id],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}.`,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ success: false, message: 'Server error updating order status.' }, { status: 500 });
  }
}
