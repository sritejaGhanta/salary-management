import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/dashboard', '/employees', '/insights', '/export', '/register', '/hr-managers'];
  const publicRoutes = ['/login'];

  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
  const isPublic = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/employees/:path*',
    '/insights/:path*',
    '/export/:path*',
    '/login',
    '/register',
    '/hr-managers/:path*',
  ],
};
