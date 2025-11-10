// Simplified session helper adapted to custom JWT cookie auth (replaces legacy next-auth usage).
// Attempts to read the `access_token` cookie, decode its payload (without signature verification)
// and expose a minimal session object with `user.id` derived from `sub` claim.
// Returns `null` if no valid token is found.
import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
}
export interface Session {
  user: SessionUser;
}

function decodeJwtPayload(token: string): any | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const userId = payload?.sub || payload?.userId || payload?.uid;
  if (!userId || typeof userId !== "string") return null;
  return { user: { id: userId } };
}