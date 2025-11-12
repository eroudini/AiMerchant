import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (base) {
      const res = await fetch(`${base}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie") ?? "",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
    // Fallback mock si aucune API distante configurée
    return NextResponse.json({ message: "Profil mis à jour (mock)" }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: "Erreur de mise à jour" }, { status: 400 });
  }
}
