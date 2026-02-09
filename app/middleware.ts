import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth-session');
  const pathname = request.nextUrl.pathname;

  // Пути, которые доступны без авторизации
  const publicPaths = ['/auth/login', '/api/auth/login'];
  
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Проверяем сессию
  if (!sessionCookie) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);
    
    // Проверяем срок действия
    if (sessionData.expires && new Date(sessionData.expires) < new Date()) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('error', 'Сессия истекла');
      return NextResponse.redirect(loginUrl);
    }

    // Проверяем доступ к админке
    if (pathname.startsWith('/admin') && sessionData.role !== 'ADMIN') {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('error', 'Доступ только для администраторов');
      return NextResponse.redirect(loginUrl);
    }

    // Проверяем доступ к менеджерской зоне
    if (pathname.startsWith('/managers') && !['ADMIN', 'MANAGER'].includes(sessionData.role)) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('error', 'Доступ только для менеджеров');
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('error', 'Ошибка авторизации');
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/managers/:path*',
    '/auth/login',
  ],
};