import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect /admin routes
  if (path.startsWith('/admin')) {
    // Allow access to login page
    if (path === '/admin/login') {
      // If already logged in, redirect to admin dashboard
      const adminSession = request.cookies.get('admin_session');
      if (adminSession?.value === 'authenticated') {
        return NextResponse.redirect(new URL('/admin/quotes', request.url));
      }
      return NextResponse.next();
    }

    // Check for authentication for other admin routes
    const adminSession = request.cookies.get('admin_session');
    if (adminSession?.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
