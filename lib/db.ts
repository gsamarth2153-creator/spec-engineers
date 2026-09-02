import { createClient, Client } from '@libsql/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

let clientInstance: Client | null = null;

export function getDb(): Client {
  if (clientInstance) {
    return clientInstance;
  }

  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'cms.db');
  const url = process.env.TURSO_DATABASE_URL || `file:${dbPath}`;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  clientInstance = createClient({
    url,
    authToken,
  });

  return clientInstance;
}

export async function initDb(): Promise<void> {
  const db = getDb();

  // 1. Create admin_users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. Create categories table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 3. Create products table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT UNIQUE,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      category_id TEXT,
      category_name TEXT NOT NULL,
      subcategory TEXT,
      price REAL NOT NULL DEFAULT 0.0,
      sale_price REAL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      stock_status TEXT NOT NULL DEFAULT 'in_stock',
      brand TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      featured_image TEXT NOT NULL,
      specifications TEXT,
      features TEXT,
      product_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);

  // 4. Create product_images table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  // 5. Create orders table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      company_name TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      additional_requirements TEXT,
      subtotal REAL NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 6. Create order_items table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT,
      product_name TEXT NOT NULL,
      sku TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );
  `);

  // Create indexes for faster queries
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_name);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);`);

  // Auto seed default admin if no admin exists
  await autoSeedAdmin(db);
}

async function autoSeedAdmin(db: Client) {
  try {
    const defaultEmail = (process.env.ADMIN_EMAIL || 'admin@specengineer.in').trim().toLowerCase();
    const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin@SpecEngineer2026!';

    const userRes = await db.execute({
      sql: 'SELECT id FROM admin_users WHERE email = ?',
      args: [defaultEmail],
    });

    if (userRes.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(defaultPassword, salt);
      const id = 'admin_root';
      const now = new Date().toISOString();

      await db.execute({
        sql: `INSERT OR REPLACE INTO admin_users (id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, 'admin', ?, ?)`,
        args: [id, defaultEmail, passwordHash, 'Global Administrator', now, now],
      });
      console.log(`[Product CMS DB] Global admin user initialized: ${defaultEmail}`);
    }
  } catch (err) {
    console.error('[Product CMS DB] Failed to auto seed admin user:', err);
  }
}

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string;
  description: string;
  category_id: string | null;
  category_name: string;
  subcategory: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'low_stock';
  brand: string | null;
  featured: number; // 0 or 1
  status: 'draft' | 'published' | 'archived';
  featured_image: string;
  specifications: string | null;
  features: string | null;
  product_url: string | null;
  created_at: string;
  updated_at: string;
  gallery_images?: string[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  company_name: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  additional_requirements: string | null;
  subtotal: number;
  total_amount: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  featured_image?: string;
}
