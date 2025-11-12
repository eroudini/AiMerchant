"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api.client";
import { Bell } from "lucide-react";

export default function AlertsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await apiClient.get("/dashboard/alerts");
      return res.data as any[];
    },
  });

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-4 h-4 text-[color:var(--brand)]" />
        <h2 className="font-semibold">Alertes récentes</h2>
      </div>
      {isLoading && <div className="h-24 animate-pulse" />}
      {error && <div className="text-red-600 text-sm">Erreur de chargement</div>}
      <ul className="space-y-3">
        {(data ?? []).map((a, idx) => (
          <li key={idx} className="border rounded-xl p-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium">{a.type}</div>
              <div className="text-sm text-gray-600">{a.text}</div>
            </div>
            <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
