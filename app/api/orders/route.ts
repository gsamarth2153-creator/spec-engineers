import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb, Product } from '@/lib/db';
import nodemailer from 'nodemailer';

const NOTIFICATION_RECIPIENTS = [
  'spec.engrs@gmail.com',
  'samsrthgarg2153@gmail.com',
];

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const db = getDb();
    const body = await req.json();

    const {
      product_id,
      quantity = 1,
      customer_name,
      customer_phone,
      customer_email,
      company_name,
      address,
      city,
      state,
      pincode,
      additional_requirements,
    } = body;

    // 1. Basic Customer Validation
    if (!product_id || !customer_name || !customer_phone || !customer_email || !address || !city || !state || !pincode) {
      return NextResponse.json(
        { success: false, message: 'All required customer and delivery fields must be provided.' },
        { status: 400 }
      );
    }

    const orderQty = Math.max(1, parseInt(quantity) || 1);

    // 2. Fetch authoritative Product from database (DO NOT trust frontend price!)
    const productRes = await db.execute({
      sql: "SELECT * FROM products WHERE id = ? AND status = 'published'",
      args: [product_id],
    });

    if (productRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found or currently unavailable for ordering.' },
        { status: 404 }
      );
    }

    const product = productRes.rows[0] as unknown as Product;

    // Check stock availability
    if (product.stock_status === 'out_of_stock' || product.stock_quantity < orderQty) {
      return NextResponse.json(
        { success: false, message: `Insufficient stock available. Only ${product.stock_quantity} unit(s) in stock.` },
        { status: 400 }
      );
    }

    // 3. Compute Price & Total Amount server-side
    const unitPrice = product.sale_price && product.sale_price < product.price
      ? product.sale_price
      : product.price;

    const totalAmount = unitPrice * orderQty;

    // 4. Generate unique Order Number (e.g. ORD-2026-0001)
    const countRes = await db.execute('SELECT COUNT(*) as count FROM orders');
    const orderCount = Number(countRes.rows[0]?.count || 0) + 1;
    const year = new Date().getFullYear();
    const orderNumber = `ORD-${year}-${String(orderCount).padStart(4, '0')}`;

    const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const itemId = 'item_' + Date.now() + '_1';
    const now = new Date().toISOString();

    // 5. Insert Order
    await db.execute({
      sql: `INSERT INTO orders (
        id, order_number, customer_name, customer_email, customer_phone, company_name,
        address, city, state, pincode, additional_requirements, subtotal, total_amount,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)`,
      args: [
        orderId,
        orderNumber,
        customer_name.trim(),
        customer_email.trim().toLowerCase(),
        customer_phone.trim(),
        company_name ? company_name.trim() : null,
        address.trim(),
        city.trim(),
        state.trim(),
        pincode.trim(),
        additional_requirements ? additional_requirements.trim() : null,
        totalAmount,
        totalAmount,
        now,
        now,
      ],
    });

    // 6. Insert Order Item
    await db.execute({
      sql: `INSERT INTO order_items (
        id, order_id, product_id, product_name, sku, quantity, unit_price, total_price, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        itemId,
        orderId,
        product.id,
        product.name,
        product.sku || null,
        orderQty,
        unitPrice,
        totalAmount,
        now,
      ],
    });

    // 7. Update Product Stock Quantity
    const newStockQty = Math.max(0, product.stock_quantity - orderQty);
    const newStockStatus = newStockQty === 0 ? 'out_of_stock' : newStockQty < 5 ? 'low_stock' : 'in_stock';

    await db.execute({
      sql: 'UPDATE products SET stock_quantity = ?, stock_status = ?, updated_at = ? WHERE id = ?',
      args: [newStockQty, newStockStatus, now, product.id],
    });

    // 8. Trigger Email Notifications via Nodemailer
    try {
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;
      const isPlaceholderPass = !emailPass || emailPass.includes('your-') || emailPass.includes('placeholder');

      if (emailUser && emailPass && !isPlaceholderPass) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: emailUser, pass: emailPass },
        });

        // Admin Email HTML
        const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">🛒 New Order Request Received</h2>
          <p style="color: #475569; font-size: 14px;">Order Number: <b style="color: #2563eb;">${orderNumber}</b></p>
          
          <table style="border-collapse: collapse; width: 100%; margin-top: 16px; font-size: 14px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold; width: 35%;">Customer Name</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;"><b>${customer_name}</b></td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Phone Number</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;"><a href="tel:${customer_phone}">${customer_phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Email Address</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;"><a href="mailto:${customer_email}">${customer_email}</a></td>
            </tr>
            ${
              company_name
                ? `<tr>
                    <td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Company Name</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0;">${company_name}</td>
                   </tr>`
                : ''
            }
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Product Ordered</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;"><b style="color: #0f172a;">${product.name}</b></td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Quantity</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${orderQty} unit(s)</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Unit Price</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">₹${unitPrice.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Total Amount</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0; color: #2563eb; font-weight: bold; font-size: 16px;">₹${totalAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Delivery Address</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${address}, ${city}, ${state} - ${pincode}</td>
            </tr>
            ${
              additional_requirements
                ? `<tr>
                    <td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Custom Requirements</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${additional_requirements}</td>
                   </tr>`
                : ''
            }
          </table>

          <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; text-align: center;">
            SPEC ENGINEERS Admin Notification System
          </div>
        </div>`;

        await transporter.sendMail({
          from: `"SPEC ENGINEERS Orders" <${emailUser}>`,
          to: NOTIFICATION_RECIPIENTS,
          subject: `🛒 New Order ${orderNumber} - ${product.name} (${customer_name})`,
          html: adminHtml,
        });

        // Customer Email
        const customerHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #334155;">
          <h2 style="color: #0f172a;">Dear ${customer_name},</h2>
          <p>Thank you for submitting your order request with <b>SPEC ENGINEERS</b>.</p>
          <p>Your Order Number is <b>${orderNumber}</b>.</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><b>Product:</b> ${product.name}</p>
            <p style="margin: 4px 0;"><b>Quantity:</b> ${orderQty}</p>
            <p style="margin: 4px 0;"><b>Estimated Total:</b> ₹${totalAmount.toLocaleString('en-IN')}</p>
          </div>
          <p>Our sales engineering team will review your order details and contact you shortly.</p>
          <br/>
          <p>Best regards,<br/><b>SPEC ENGINEERS Team</b></p>
        </div>`;

        await transporter.sendMail({
          from: `"SPEC ENGINEERS" <${emailUser}>`,
          to: customer_email,
          subject: `Order Request Confirmation (${orderNumber}) - SPEC ENGINEERS`,
          html: customerHtml,
        });
      }
    } catch (emailErr) {
      console.warn('Order email notification warning:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Order request created successfully.',
      order_number: orderNumber,
      total_amount: totalAmount,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Server error processing order.' },
      { status: 500 }
    );
  }
}
