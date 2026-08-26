import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'specengineer_super_secret_admin_jwt_key_2026_spec';
const key = new TextEncoder().encode(JWT_SECRET_KEY);
const ADMIN_COOKIE_NAME = 'admin_session';

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload && payload.role === 'admin' ? payload : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes and /api/admin routes
  const isAdminPageRoute = pathname.startsWith('/admin');
  const isAdminApiRoute = pathname.startsWith('/api/admin');
  const isLoginRoute = pathname === '/admin' || pathname === '/admin/';
  const isAuthApiRoute = pathname.startsWith('/api/admin/auth/login');

  if (isAdminPageRoute || isAdminApiRoute) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const adminUser = token ? await verifyToken(token) : null;

    // Handle API authorization
    if (isAdminApiRoute && !isAuthApiRoute) {
      if (!adminUser) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized. Admin access required.' },
          { status: 401 }
        );
      }
    }

    // Handle Admin pages authorization
    if (isAdminPageRoute) {
      // If user is already authenticated and visits /admin (login page), redirect to /admin/dashboard
      if (isLoginRoute && adminUser) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }

      // If user is NOT authenticated and tries to access /admin/dashboard or subpages, redirect to /admin
      if (!isLoginRoute && !adminUser) {
        const loginUrl = new URL('/admin', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Add security headers (noindex for search engines)
    const response = NextResponse.next();
    if (isAdminPageRoute) {
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
