import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/api.server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (base) {
      const res = await serverApi.post(`/auth/register`, body);
      return NextResponse.json(res.data, { status: res.status });
    }
    // Mock response
    return NextResponse.json({ user: { id: "u1", ...body }, requiresEmailVerification: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: "Erreur à l'inscription" }, { status: 400 });
  }
}
