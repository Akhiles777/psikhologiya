import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/auth-admin";

const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ?? "dev_admin_session_change_me";

/**
 * Защита админки: только с валидной сессией.
 * /admin/login — доступна всем, остальные /admin/* — только после входа.
 */
export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token !== ADMIN_SESSION_SECRET) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
