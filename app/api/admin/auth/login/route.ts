import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { verifyPassword, signAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await initDb();
    const db = getDb();
    const body = await req.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user by email
    const userRes = await db.execute({
      sql: 'SELECT id, email, password_hash, name, role FROM admin_users WHERE email = ?',
      args: [cleanEmail],
    });

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials or user does not exist.' },
        { status: 401 }
      );
    }

    const user = userRes.rows[0];
    const passwordHash = user.password_hash as string;
    const userRole = user.role as string;

    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin role required.' },
        { status: 403 }
      );
    }

    const isValidPassword = await verifyPassword(password, passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // Sign JWT token
    const token = await signAdminToken({
      userId: user.id as string,
      email: user.email as string,
      name: (user.name as string) || 'Admin',
      role: 'admin',
    });

    // Create response with HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
