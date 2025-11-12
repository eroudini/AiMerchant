import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const token = cookies.get("access_token")?.value;
  const path = nextUrl.pathname;

  const isProtected = path === "/dashboard" || path === "/spyscope" || path.startsWith("/app");
  if (isProtected && !token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", path + (nextUrl.search || ""));
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/spyscope", "/app/:path*"],
};
