import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Read .env.local if present
const envPath = path.join(process.cwd(), '.env.local');
let envEmail = 'admin@specengineer.in';
let envPassword = 'Admin@SpecEngineer2026!';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    const val = vals.join('=').trim();
    if (key.trim() === 'ADMIN_EMAIL') envEmail = val;
    if (key.trim() === 'ADMIN_PASSWORD') envPassword = val;
  }
}

// Allow passing new password via CLI: node scripts/reset-admin-password.mjs <new_password>
const targetPassword = process.argv[2] || process.env.ADMIN_PASSWORD || envPassword;
const targetEmail = process.argv[3] || process.env.ADMIN_EMAIL || envEmail;

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'cms.db');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || `file:${dbPath}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log(`Setting admin password for: ${targetEmail}`);
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(targetPassword, salt);
  const now = new Date().toISOString();

  const userRes = await db.execute({
    sql: 'SELECT id FROM admin_users WHERE email = ?',
    args: [targetEmail],
  });

  if (userRes.rows.length === 0) {
    await db.execute({
      sql: `INSERT INTO admin_users (id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, 'admin', ?, ?)`,
      args: ['admin_root', targetEmail, hash, 'Global Administrator', now, now],
    });
    console.log(`✅ Created admin user ${targetEmail} with specified password.`);
  } else {
    await db.execute({
      sql: `UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE email = ?`,
      args: [hash, now, targetEmail],
    });
    console.log(`✅ Updated password for ${targetEmail} in the database.`);
  }

  console.log(`\nReady to login!`);
  console.log(`Email:    ${targetEmail}`);
  console.log(`Password: ${targetPassword}\n`);
}

main().catch((err) => {
  console.error('Error resetting password:', err);
  process.exit(1);
});
