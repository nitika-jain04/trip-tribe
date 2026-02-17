// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export function middleware(request) {
//   const token = request.cookies.get("token")?.value;
//   const { pathname } = request.nextUrl;

//   // 🔒 Protect admin routes
//   if (pathname.startsWith("/admin")) {
//     if (!token) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }

//     try {
//       const decoded = jwt.decode(token);
//       const role = decoded?.role;

//       if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
//         return NextResponse.redirect(new URL("/unauthorized", request.url));
//       }
//     } catch (error) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*"],
// };

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decoded = jwt.decode(token);
      const role = decoded?.role;

      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
