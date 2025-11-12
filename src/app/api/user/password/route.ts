import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/api.server";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const auth = req.headers.get("authorization") ?? "";
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (base) {
      const res = await serverApi.patch(`/user/password`, body, { headers: { authorization: auth, cookie: req.headers.get("cookie") ?? "" } });
      return NextResponse.json(res.data ?? {}, { status: res.status });
    }
    return NextResponse.json({}, { status: 204 });
  } catch (e: any) {
    return NextResponse.json({ message: "Erreur" }, { status: 400 });
  }
}
