import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb, Order } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    await initDb();
    const db = getDb();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || 'all';

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params: (string | number)[] = [];

    if (status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.execute({ sql: query, args: params });
    const orders = result.rows as unknown as Order[];

    // Attach items preview to each order using a single batch query (O(1) roundtrip)
    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const placeholders = orderIds.map(() => '?').join(',');
      const itemsRes = await db.execute({
        sql: `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
        args: orderIds,
      });

      const itemsMap: Record<string, any[]> = {};
      for (const item of itemsRes.rows) {
        const oId = String(item.order_id);
        if (!itemsMap[oId]) itemsMap[oId] = [];
        itemsMap[oId].push(item);
      }

      for (const order of orders) {
        order.items = itemsMap[order.id] || [];
      }
    }

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch orders.' }, { status: 500 });
  }
}
