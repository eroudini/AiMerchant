"use client";
import React from "react";
import { CalendarClock } from "lucide-react";
import { products } from "@/data/mock";
import { daysUntilOOS } from "@/lib/metrics";

export default function Forecast() {
  const items = products
    .slice(0, 3)
    .map((p) => {
      const d = daysUntilOOS(p.stock, p.avgDailySales);
      const advised = Number.isFinite(d) ? Math.max(0, Math.ceil(p.avgDailySales * 7) - p.stock) : 0; // viser 1 semaine de dispo
      return { sku: p.sku, days: d, advise: advised };
    });

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock className="w-4 h-4 text-[color:var(--brand)]" />
        <h2 className="font-semibold">Prévisions de rupture</h2>
      </div>
      <ul className="space-y-2 text-sm">
        {items.map((it) => (
          <li key={it.sku} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
            <div className="font-medium text-white/90">{it.sku}</div>
            <div className="text-neutral-300">
              Rupture probable: {Number.isFinite(it.days) ? `${it.days} j` : "∞"}
            </div>
            <div className="text-neutral-300">Stock conseillé: {it.advise > 0 ? `+${it.advise} u.` : "Aucune donnée"}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
