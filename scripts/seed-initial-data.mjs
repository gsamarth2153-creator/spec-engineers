import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'cms.db');
const db = createClient({
  url: `file:${dbPath}`,
});

async function main() {
  console.log('Seeding initial SpecEngineer Product CMS database...');

  // 1. Tables init
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

  const now = new Date().toISOString();

  // 2. Seed Admin
  const adminEmail = 'admin@specengineer.in';
  const adminPassword = 'Admin@SpecEngineer2026!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await db.execute({
    sql: `INSERT OR REPLACE INTO admin_users (id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, 'admin', ?, ?)`,
    args: ['admin_root', adminEmail, passwordHash, 'System Administrator', now, now],
  });
  console.log(`✅ Seeded admin account: ${adminEmail}`);

  // 3. Seed Categories
  const cat1Id = 'cat_grinding';
  const cat2Id = 'cat_turbine';

  await db.execute({
    sql: `INSERT OR REPLACE INTO categories (id, name, slug, description, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [cat1Id, 'Precision Tooling & Grinding', 'precision-tooling-grinding', 'High-precision surface and cylindrical grinding attachments, spindles, and fixtures.', null, now, now],
  });

  await db.execute({
    sql: `INSERT OR REPLACE INTO categories (id, name, slug, description, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [cat2Id, 'Turbine & Power Components', 'turbine-power-components', 'Reconditioned steam turbine blades, nozzles, and power generation spare parts.', null, now, now],
  });

  // 4. Seed Sample Product 1
  const prod1Id = 'prod_sample_01';
  await db.execute({
    sql: `INSERT OR REPLACE INTO products (
      id, name, slug, sku, short_description, description, category_id, category_name, subcategory,
      price, sale_price, stock_quantity, stock_status, brand, featured, status, featured_image,
      specifications, features, product_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      prod1Id,
      'Automated High-Precision CNC Grinding Spindle Assembly',
      'automated-high-precision-cnc-grinding-spindle-assembly',
      'SE-GRIND-9000',
      'Heavy-duty 3-axis CNC surface & cylindrical grinding spindle with internal cooling and sub-micron runout precision.',
      'Designed and engineered by SPEC ENGINEERS for extreme accuracy in automotive shaft and hydraulic component manufacturing. Features dynamic balancing, anti-vibration body damping, and integrated coolant through-spindle channels.',
      cat1Id,
      'Precision Tooling & Grinding',
      'Spindle Assemblies',
      85000,
      74999,
      12,
      'in_stock',
      'SPEC ENGINEERS',
      1,
      'published',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      'Speed: 12000 RPM\nTorque: 45 Nm\nRunout Accuracy: < 0.002 mm\nCoolant: Internal\nWeight: 18.5 kg',
      '• Sub-micron runout accuracy\n• Internal through-spindle coolant system\n• ISO 9001 certified dynamic balancing\n• Hardened alloy steel housing',
      'https://specengineer.in',
      now,
      now,
    ],
  });

  // Sample Product 1 Gallery
  await db.execute({
    sql: `INSERT OR REPLACE INTO product_images (id, product_id, image_url, display_order, created_at) VALUES (?, ?, ?, ?, ?)`,
    args: ['img_prod1_a', prod1Id, 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80', 0, now],
  });

  // 5. Seed Sample Product 2
  const prod2Id = 'prod_sample_02';
  await db.execute({
    sql: `INSERT OR REPLACE INTO products (
      id, name, slug, sku, short_description, description, category_id, category_name, subcategory,
      price, sale_price, stock_quantity, stock_status, brand, featured, status, featured_image,
      specifications, features, product_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      prod2Id,
      'Industrial Steam Turbine Reconditioned Blade Set',
      'industrial-steam-turbine-reconditioned-blade-set',
      'SE-TURB-450',
      'Precision reconditioned aero-profile steam turbine blade set engineered for heavy thermal power plants.',
      'Complete reverse-engineered and reconditioned turbine blade assembly. Restores optimal aerodynamic contour and thermal barrier coating, improving overall turbine efficiency by up to 4.2%.',
      cat2Id,
      'Turbine & Power Components',
      'Turbine Blades',
      240000,
      null,
      4,
      'low_stock',
      'SPEC ENGINEERS',
      1,
      'published',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      'Material: Inconel 718 Superalloy\nMax Temp: 850°C\nBalancing: ISO G1.0\nBlade Length: 450 mm',
      '• Superalloy thermal barrier protection\n• Aerodynamic profile re-contouring\n• ISO G1.0 precision dynamic balance\n• High temperature oxidation resistance',
      'https://specengineer.in',
      now,
      now,
    ],
  });

  console.log('✅ Seeded sample product categories and published products.');
  console.log('Product CMS database initialization complete!');
}

main().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
