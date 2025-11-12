import { cookies } from "next/headers";

// Server helper to read access token from cookies
export function getServerAccessToken(): string | null {
  try {
    // cookies() is only available on the server; ignore types when not resolvable
    const jar: any = cookies() as any;
    const token = jar?.get?.("accessToken")?.value as string | undefined;
    return token ?? null;
  } catch {
    return null;
  }
}
