"use client";
import React from "react";
import { Tags } from "lucide-react";
import { products } from "@/data/mock";
import { calcMarginPct, suggestPrice } from "@/lib/metrics";

export default function PricingSuggestions() {
  const rows = products.map((p) => {
    const suggested = suggestPrice(p.price, p.compPrice, p.buy, p.fees);
    const marginApplied = calcMarginPct(suggested, p.buy, p.fees);
    return { sku: p.sku, current: p.price, comp: p.compPrice, suggested, marginApplied };
  });

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Tags className="w-4 h-4 text-[color:var(--brand)]" />
        <h2 className="font-semibold">Suggestions de prix</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse text-neutral-200">
          <thead>
            <tr className="text-left border-b border-white/10">
              <th className="py-2">SKU</th>
              <th className="py-2">Actuel (€)</th>
              <th className="py-2">Concurrent (€)</th>
              <th className="py-2">Suggéré (€)</th>
              <th className="py-2">Marge % (suggéré)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sku} className="border-b border-white/10 last:border-0">
                <td className="py-2 font-medium">{r.sku}</td>
                <td className="py-2">{r.current.toFixed(2)}</td>
                <td className="py-2">{r.comp.toFixed(2)}</td>
                <td className="py-2">{r.suggested.toFixed(2)}</td>
                <td className="py-2">{r.marginApplied}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
