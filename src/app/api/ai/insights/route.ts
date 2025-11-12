import { NextResponse } from "next/server";
import { serverApi } from "@/lib/api.server";

export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (base) {
      const res = await serverApi.get(`/ai/insights`);
      return NextResponse.json(res.data, { status: res.status });
    }
    // Fallback mock insights
    const data = [
      { title: "Augmenter le prix de SKU A-123 de 3%", detail: "Impact estimé +1.2% marge.", action: { label: "Voir action", href: "#" } },
      { title: "Campagne promo ciblée sur top 10% clients", detail: "ROI attendu x4 en 10 jours.", action: { label: "Voir action", href: "#" } },
      { title: "Rupture probable sur C-789", detail: "Prévoir réassort sous 5 jours." },
    ];
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
