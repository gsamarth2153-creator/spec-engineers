import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getDb, initDb, AdminUser } from './db';

const JWT_SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'specengineer_super_secret_admin_jwt_key_2026_spec';
const key = new TextEncoder().encode(JWT_SECRET_KEY);

export const ADMIN_COOKIE_NAME = 'admin_session';

export interface AdminJwtPayload {
  userId: string;
  email: string;
  role: 'admin';
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signAdminToken(payload: AdminJwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function verifyAdminToken(token: string): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    if (payload && payload.role === 'admin' && typeof payload.userId === 'string' && typeof payload.email === 'string') {
      return {
        userId: payload.userId,
        email: payload.email,
        role: 'admin',
        name: (payload.name as string) || 'Admin',
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAdminSessionFromCookies(): Promise<AdminJwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function verifyAdminRequest(req: NextRequest): Promise<AdminJwtPayload | null> {
  // Check cookie first
  let token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  // Fallback to Authorization header if present
  if (!token) {
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  const payload = await verifyAdminToken(token);
  if (!payload || payload.role !== 'admin') {
    return null;
  }

  // Also verify user exists in DB with role='admin'
  try {
    await initDb();
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT id, email, role FROM admin_users WHERE id = ? AND role = 'admin'",
      args: [payload.userId],
    });

    if (result.rows.length === 0) {
      return null;
    }
  } catch (error) {
    console.error('Database validation error in verifyAdminRequest:', error);
    return null;
  }

  return payload;
}
