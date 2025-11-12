import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/api.server";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({}, { status: 204 });
  // Toujours expirer le cookie d'accès côté frontend, même si le backend est indisponible
  response.cookies.set("access_token", "", { maxAge: 0, path: "/" });

  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    return response;
  }

  try {
    const res = await serverApi.post(`/auth/logout`, {}, {
      headers: { cookie: req.headers.get("cookie") ?? "" },
      validateStatus: () => true,
    });
    // Propager d'éventuels Set-Cookie backend (par ex. suppression de refresh token), sans échouer côté client
    const setCookie = (res.headers as any)["set-cookie"] as undefined | string | string[];
    if (Array.isArray(setCookie)) {
      for (const c of setCookie) response.headers.append("set-cookie", c);
    } else if (typeof setCookie === "string") {
      response.headers.set("set-cookie", setCookie);
    }
  } catch {
    // Ignorer les erreurs réseau/backend: le client reste correctement déconnecté grâce à l'expiration du cookie
  }
  return response;
}
