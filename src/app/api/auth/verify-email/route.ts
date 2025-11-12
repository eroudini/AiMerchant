import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/api.server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (base) {
      const res = await serverApi.post(`/auth/verify-email`, body);
      return NextResponse.json(res.data ?? {}, { status: res.status });
    }
    return NextResponse.json({}, { status: 204 });
  } catch (e: any) {
    return NextResponse.json({ message: "Erreur" }, { status: 400 });
  }
}
