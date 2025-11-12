import { NextResponse } from "next/server";
import { serverApi } from "@/lib/api.server";

export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (base) {
      const res = await serverApi.get(`/dashboard/alerts`);
      return NextResponse.json(res.data, { status: res.status });
    }
    // Fallback mock
    const now = Date.now();
    const items = [
      { type: "Baisse des ventes", text: "-12% sur 7j pour SKU A-123", createdAt: new Date(now - 86400000).toISOString() },
      { type: "Marge faible", text: "SKU B-456 marge < 10%", createdAt: new Date(now - 3600000).toISOString() },
    ];
    return NextResponse.json(items, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
