import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest, signAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await verifyAdminRequest(req);

  if (!admin) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    success: true,
    user: admin,
  });

  // Re-sign session cookie with live DB permissions so changes take effect seamlessly
  try {
    const freshToken = await signAdminToken(admin);
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: freshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
  } catch (err) {
    console.error('Error refreshing admin session cookie:', err);
  }

  return response;
}
