"use client";
import React from "react";
import { sales30d, alerts, products } from "@/data/mock";
import { calcMarginPct } from "@/lib/metrics";

export default function KPIGrid() {
  // Calculs mockés localement
  const revenue30d = Math.round(sales30d.reduce((acc, s) => acc + s.revenue, 0));
  const orders30d = sales30d.length;
  const avgMargin = Math.round(
    products.reduce((acc, p) => acc + calcMarginPct(p.price, p.buy, p.fees), 0) / products.length
  );
  const alertsCount = alerts.length;

  const items: { label: string; value: string | number }[] = [
    { label: "Chiffre d'affaires 30j", value: `${revenue30d.toLocaleString("fr-FR")} €` },
    { label: "Commandes 30j", value: orders30d },
    { label: "Marge %", value: `${avgMargin}%` },
    { label: "Alertes", value: alertsCount },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((it) => (
        <div key={it.label} className="card p-4 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wide text-gray-500">{it.label}</span>
          <span className="text-2xl font-semibold">{it.value}</span>
        </div>
      ))}
    </div>
  );
}
