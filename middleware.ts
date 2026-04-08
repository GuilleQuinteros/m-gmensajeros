import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas publicas — pasan sin auth
  if (
    pathname.startsWith("/t/") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/tracking") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Sin sesion — al login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const role = token.role as string;

  // Verificar acceso por rol
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  if (pathname.startsWith("/pdv") && role !== "pdv") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  if (pathname.startsWith("/trans") && role !== "transportista") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)",
  ],
};