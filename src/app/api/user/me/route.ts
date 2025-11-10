import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/api.server";

export async function GET(req: NextRequest) {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const auth = req.headers.get("authorization") ?? "";
    if (base) {
      // Côté backend, l’endpoint est /auth/me (voir server/src/routes/auth.ts)
      const res = await serverApi.get(`/auth/me`, { headers: { authorization: auth, cookie: req.headers.get("cookie") ?? "" } });
      return NextResponse.json(res.data, { status: res.status });
    }
  // Mock fallback: utilise le cookie access_token (aligné sur les proxys / backend)
  const token = req.cookies.get("access_token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ id: "u1", firstName: "Demo", lastName: "User", email: "demo@example.com" }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
