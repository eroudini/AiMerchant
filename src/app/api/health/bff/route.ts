import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/api.server";

export async function GET(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    return NextResponse.json({ up: false, reason: "no_base" }, { status: 200 });
  }
  try {
    const res = await serverApi.get(`/bff/kpi/overview`, {
      params: { period: "last_7d" },
      headers: { cookie: req.headers.get("cookie") ?? "" },
      // We treat 401/403 as UP (auth required but server reachable)
      validateStatus: () => true,
    });
    const status = res.status;
    const up = status < 500 && status !== 0;
    const reason = status >= 500 ? `status_${status}` : (status === 401 || status === 403 ? "auth" : "ok");
    return NextResponse.json({ up, reason, status }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ up: false, reason: "network" }, { status: 200 });
  }
}
