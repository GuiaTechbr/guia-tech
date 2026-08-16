import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  verificarSessaoAdmin,
} from "@/lib/session";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const protegido =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (!protegido) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const sessao = request.cookies.get(COOKIE_NAME)?.value;

  if (!verificarSessaoAdmin(sessao)) {
    const url = request.nextUrl.clone();

    url.pathname = "/admin/login";

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};