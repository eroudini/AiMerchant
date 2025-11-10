import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/api.server";

export async function POST(req: NextRequest) {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (base) {
      const res = await serverApi.post(`/auth/logout`, {}, { headers: { cookie: req.headers.get("cookie") ?? "" } });
      const response = NextResponse.json({}, { status: res.status });
      const setCookie = (res.headers as any)["set-cookie"] as undefined | string | string[];
      if (Array.isArray(setCookie)) {
        for (const c of setCookie) response.headers.append("set-cookie", c);
      } else if (typeof setCookie === "string") {
        response.headers.set("set-cookie", setCookie);
      }
      return response;
    }
  const response = NextResponse.json({}, { status: 204 });
  response.cookies.set("access_token", "", { maxAge: 0, path: "/" });
    return response;
  } catch (e: any) {
    return NextResponse.json({ message: "Erreur de déconnexion" }, { status: 500 });
  }
}
