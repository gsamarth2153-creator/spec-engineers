import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'specengineer_super_secret_admin_jwt_key_2026_spec';
const key = new TextEncoder().encode(JWT_SECRET_KEY);
const ADMIN_COOKIE_NAME = 'admin_session';

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload && (payload.role === 'admin' || payload.role === 'super_admin') ? payload : null;
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

      const isSuperAdmin = Boolean(adminUser.isSuperAdmin || adminUser.role === 'super_admin');
      const perms = (adminUser.permissions as {
        dashboard?: boolean;
        orders?: boolean;
        orders_edit?: boolean;
        products?: boolean;
        products_edit?: boolean;
        categories?: boolean;
        categories_edit?: boolean;
      }) || {
        dashboard: true,
        orders: true,
        orders_edit: true,
        products: true,
        products_edit: true,
        categories: true,
        categories_edit: true,
      };

      if (pathname.startsWith('/api/admin/team') && !isSuperAdmin) {
        return NextResponse.json(
          { success: false, message: 'Forbidden: Only primary administrator can access team settings.' },
          { status: 403 }
        );
      }

      if (!isSuperAdmin) {
        const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);

        // Orders: read and edit access
        if (pathname.startsWith('/api/admin/orders')) {
          if (perms.orders === false) {
            return NextResponse.json(
              { success: false, message: 'Forbidden: You do not have permission to access orders.' },
              { status: 403 }
            );
          }
          if (isMutation && perms.orders_edit === false) {
            return NextResponse.json(
              { success: false, message: 'Forbidden: You have read-only access to orders.' },
              { status: 403 }
            );
          }
        }

        // Products: read and edit access
        if (pathname.startsWith('/api/admin/products')) {
          if (perms.products === false) {
            return NextResponse.json(
              { success: false, message: 'Forbidden: You do not have permission to access products.' },
              { status: 403 }
            );
          }
          if (isMutation && perms.products_edit === false) {
            return NextResponse.json(
              { success: false, message: 'Forbidden: You have read-only access to products.' },
              { status: 403 }
            );
          }
        }

        // Categories: read and edit access
        if (pathname.startsWith('/api/admin/categories')) {
          if (perms.categories === false) {
            return NextResponse.json(
              { success: false, message: 'Forbidden: You do not have permission to access categories.' },
              { status: 403 }
            );
          }
          if (isMutation && perms.categories_edit === false) {
            return NextResponse.json(
              { success: false, message: 'Forbidden: You have read-only access to categories.' },
              { status: 403 }
            );
          }
        }
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

      // Role and Permission checks for authenticated users
      if (adminUser) {
        const isSuperAdmin = Boolean(adminUser.isSuperAdmin || adminUser.role === 'super_admin');
        const permissions = (adminUser.permissions as {
          dashboard?: boolean;
          orders?: boolean;
          orders_edit?: boolean;
          products?: boolean;
          products_edit?: boolean;
          categories?: boolean;
          categories_edit?: boolean;
        }) || {
          dashboard: true,
          orders: true,
          orders_edit: true,
          products: true,
          products_edit: true,
          categories: true,
          categories_edit: true,
        };

        // Team management is restricted to Super Admin only
        if (pathname.startsWith('/admin/team') && !isSuperAdmin) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }

        // Section permission restrictions for non-super admins
        if (!isSuperAdmin) {
          if (pathname.startsWith('/admin/orders') && permissions.orders === false) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
          }
          if (pathname.startsWith('/admin/products')) {
            if (permissions.products === false) {
              return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            }
            // If user has read-only access to products, redirect away from create/edit forms
            if (
              permissions.products_edit === false &&
              (pathname.startsWith('/admin/products/new') || pathname.includes('/edit'))
            ) {
              return NextResponse.redirect(new URL('/admin/products', request.url));
            }
          }
          if (pathname.startsWith('/admin/categories') && permissions.categories === false) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
          }
          if (pathname === '/admin/dashboard' && permissions.dashboard === false) {
            if (permissions.orders !== false) return NextResponse.redirect(new URL('/admin/orders', request.url));
            if (permissions.products !== false) return NextResponse.redirect(new URL('/admin/products', request.url));
            if (permissions.categories !== false) return NextResponse.redirect(new URL('/admin/categories', request.url));
          }
        }
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
