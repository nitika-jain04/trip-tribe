import { NextResponse } from "next/server";
import { decodeJwt } from "jose";

export function proxy(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      try {
        const decoded = decodeJwt(token);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      } catch {
        // Allow access if token is invalid
      }
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      const decoded = decodeJwt(token);

      if (
        !decoded ||
        decoded.exp * 1000 < Date.now() ||
        !["ADMIN", "SUPER_ADMIN"].includes(decoded.role)
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};
