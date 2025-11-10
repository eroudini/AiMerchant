import { apiClient } from "@/lib/api.client";
import type { AuthResponseLogin, User, KPIData, AlertItem, InsightItem } from "@/lib/types";

// Contrat minimal des fetchers centralisés
// - Chaque fonction retourne un type précis
// - En cas d'erreur réseau ou 4xx/5xx, l'exception axios est propagée

export async function login(email: string, password: string): Promise<AuthResponseLogin> {
  const res = await apiClient.post("/auth/login", { email, password });
  return res.data as AuthResponseLogin;
}

export async function register(data: { email: string; password: string; firstName?: string; lastName?: string }): Promise<{ user: User; requiresEmailVerification: boolean }> {
  const res = await apiClient.post("/auth/register", data);
  return res.data as { user: User; requiresEmailVerification: boolean };
}

export async function me(): Promise<User> {
  const res = await apiClient.get("/user/me");
  return res.data as User;
}

export async function updateEmail(email: string): Promise<{ message: string }> {
  const res = await apiClient.post("/user/email", { email });
  return res.data as { message: string };
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await apiClient.post("/user/password", { currentPassword, newPassword });
  return res.data as { message: string };
}

export async function fetchKpis(): Promise<KPIData> {
  const res = await apiClient.get("/dashboard/kpis");
  return res.data as KPIData;
}

export async function fetchAlerts(): Promise<AlertItem[]> {
  const res = await apiClient.get("/dashboard/alerts");
  return res.data as AlertItem[];
}

export async function fetchInsights(): Promise<InsightItem[]> {
  const res = await apiClient.get("/api/ai/insights".replace("/api/api", "/api")); // garde-fou si double préfixe
  return res.data as InsightItem[];
}

// Utilitaires d'aide TanStack Query (keys)
export const queryKeys = {
  me: ["me"],
  kpis: ["kpis"],
  alerts: ["alerts"],
  insights: ["insights"],
};
