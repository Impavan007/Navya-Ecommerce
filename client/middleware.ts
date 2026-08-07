import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const roleDashboardMap: Record<string, string> = {
  admin: '/admin/dashboard',
  seller: '/lender/dashboard',
  buyer: '/',
};

const protectedPaths = ['/lender', '/admin'];
const authPaths = ['/auth/sign-in', '/auth/Sign-up', '/auth/sign-up', '/auth/send-otp', '/auth/forgot', '/auth/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('user_role')?.value as string | undefined;

  const isAuthenticated = !!token;
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // --- 1. Role-Based Redirection from Root ---
  // We handle this early so Lenders and admins don't get stuck on the landing page.
  if (pathname === '/') {
    if (isAuthenticated && role && roleDashboardMap[role] && role !== 'buyer') {
      return NextResponse.redirect(new URL(roleDashboardMap[role], request.url));
    }
  }

  // --- 3. Handle Unauthenticated Users ---
  if (!isAuthenticated) {
    if (isProtectedPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/sign-in';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // --- 4. Handle Authenticated Users ---

  // Redirect away from auth pages if already logged in
  if (isAuthPath) {
    const dashboard = role ? roleDashboardMap[role] : '/';
    return NextResponse.redirect(new URL(dashboard || '/', request.url));
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') && role !== 'admin') {
    const dashboard = role ? roleDashboardMap[role] : '/';
    return NextResponse.redirect(new URL(dashboard || '/', request.url));
  }

  // Protect Lender routes
  if (pathname.startsWith('/lender') && role !== 'seller') {
    const dashboard = role ? roleDashboardMap[role] : '/';
    return NextResponse.redirect(new URL(dashboard || '/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets, Images, fonts (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|Images|fonts).*)',
  ],
};