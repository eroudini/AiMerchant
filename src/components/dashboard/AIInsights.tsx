"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api.client";
import { Bot } from "lucide-react";

export default function AIInsights() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const res = await apiClient.get("/ai/insights");
      return res.data as any[];
    },
  });

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-4 h-4 text-[color:var(--brand)]" />
        <h2 className="font-semibold">Recommandations IA</h2>
      </div>
      {isLoading && <div className="h-24 animate-pulse" />}
      {error && <div className="text-red-600 text-sm">Erreur de chargement</div>}
      <ul className="space-y-3">
        {(data ?? []).slice(0, 5).map((ins, idx) => (
          <li key={idx} className="border rounded-xl p-3">
            <div className="font-medium">{ins.title}</div>
            <p className="text-sm text-gray-600">{ins.detail}</p>
            {ins.action && (
              <a href={ins.action.href} className="text-sm text-[color:var(--brand)] mt-2 inline-block">
                {ins.action.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
