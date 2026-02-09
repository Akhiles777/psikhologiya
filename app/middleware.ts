import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth-session');
  const adminCookie = request.cookies.get('admin-session'); // из старой системы
  const pathname = request.nextUrl.pathname;

  // Проверяем обе системы авторизации
  const isAuthenticated = sessionCookie || adminCookie;
  
  // Пути, которые доступны без авторизации
  const publicPaths = [
    '/auth/login',
    '/managers/login', 
    '/admin/login',
    '/api/auth/login',
  ];
  
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Если не авторизован - редирект на выбор входа
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/managers/:path*',
  ],
};