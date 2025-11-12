import { NextResponse } from "next/server";
import { serverApi } from "@/lib/api.server";

export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (base) {
      const res = await serverApi.get(`/dashboard/kpis`);
      return NextResponse.json(res.data, { status: res.status });
    }
    // Fallback mock
    return NextResponse.json(
      { revenue30d: 123456, orders30d: 987, marginPct: 24.5, alertsCount: 3 },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
