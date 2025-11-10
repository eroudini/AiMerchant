import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Protect /app/* routes
  if (pathname.startsWith("/app")) {
    // Aligner sur le nom de cookie utilisé par le backend et nos proxys: "access_token"
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
  ],
};
