"use client";
import React from "react";
import { BarChart3 } from "lucide-react";
import { products, sales30d } from "@/data/mock";
import { calcMarginPct } from "@/lib/metrics";

function sumQty(sku: string) {
  return sales30d.filter((s) => s.sku === sku).reduce((acc, s) => acc + s.qty, 0);
}

export default function TopProducts() {
  // Classement par quantité 30j
  const ranked = [...products]
    .map((p) => ({ ...p, qty30d: sumQty(p.sku), marginPct: calcMarginPct(p.price, p.buy, p.fees) }))
    .sort((a, b) => b.qty30d - a.qty30d)
    .slice(0, 5);

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-[color:var(--brand)]" />
        <h2 className="font-semibold">Top ventes 30j</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse text-neutral-200">
          <thead>
            <tr className="text-left border-b border-white/10">
              <th className="py-2">SKU</th>
              <th className="py-2">Titre</th>
              <th className="py-2">Qté 30j</th>
              <th className="py-2">Marge %</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((p) => (
              <tr key={p.sku} className="border-b border-white/10 last:border-0">
                <td className="py-2 font-medium">{p.sku}</td>
                <td className="py-2">{p.title}</td>
                <td className="py-2">{p.qty30d}</td>
                <td className="py-2">{p.marginPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
