import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/api.server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (base) {
      const res = await serverApi.post(`/auth/login`, body, {
        headers: { cookie: req.headers.get("cookie") ?? "" },
      });
      const response = NextResponse.json(res.data, { status: res.status });
      const setCookie = (res.headers as any)["set-cookie"] as undefined | string | string[];
      if (Array.isArray(setCookie)) {
        for (const c of setCookie) response.headers.append("set-cookie", c);
      } else if (typeof setCookie === "string") {
        response.headers.set("set-cookie", setCookie);
      }
      return response;
    }
    // Fallback mock
    const mock = { user: { id: "u1", firstName: "Demo", lastName: "User", email: body.email }, accessToken: "demo-token" };
  const response = NextResponse.json(mock, { status: 200 });
  response.cookies.set("access_token", mock.accessToken, { httpOnly: false, path: "/" });
    return response;
  } catch (e: any) {
    return NextResponse.json({ message: "Identifiants invalides" }, { status: 401 });
  }
}
