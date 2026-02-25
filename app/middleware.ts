import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getOriginFromRequest(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = (forwardedHost || request.headers.get('host') || '').split(',')[0]?.trim();

  if (!host) {
    return request.nextUrl.origin;
  }

  const forwardedProto = request.headers.get('x-forwarded-proto');
  const proto = (forwardedProto || request.nextUrl.protocol.replace(':', '') || 'https')
    .split(',')[0]
    .trim();

  return `${proto}://${host}`;
}

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth-session');
  const adminCookie = request.cookies.get('admin_session');
  const legacyAdminCookie = request.cookies.get('admin-session');
  const managerCookie = request.cookies.get('manager_session');
  const legacyManagerCookie = request.cookies.get('manager-session');
  const pathname = request.nextUrl.pathname;

  // Проверяем актуальные и legacy-cookie разных сценариев авторизации
  const isAuthenticated = sessionCookie || adminCookie || legacyAdminCookie || managerCookie || legacyManagerCookie;
  
  // Пути, которые доступны без авторизации
  const publicPaths = [
    '/auth/login',
    '/managers/login', 
    '/admin/login',
    '/api/auth/login',
  ];
  
  if (publicPaths.some((publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`))) {
    return NextResponse.next();
  }

  // Если не авторизован - редирект на выбор входа
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', getOriginFromRequest(request)));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/managers/:path*',
  ],
};
