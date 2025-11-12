"use client";
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { sales30d } from "@/data/mock";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function SalesChart() {
  // Regrouper revenus par jour (ISO date -> label J1..J14 sur les 14 derniers jours)
  const lastDays = 14;
  const today = Date.now();
  const buckets: { label: string; revenue: number }[] = [];
  for (let i = lastDays - 1; i >= 0; i--) {
    const d = new Date(today - i * 86400000);
    const isoDay = d.toISOString().slice(0, 10);
    const revenue = sales30d
      .filter((s) => s.date.startsWith(isoDay))
      .reduce((acc, s) => acc + s.revenue, 0);
    buckets.push({ label: `J${lastDays - i}`, revenue: Math.round(revenue) });
  }
  const data = {
    labels: buckets.map((b) => b.label),
    datasets: [
      {
        label: "CA quotidien",
        data: buckets.map((b) => b.revenue),
        fill: true,
        borderColor: "#2563EB",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.35,
      },
    ],
  };

  return (
    <section className="card p-4">
      <h2 className="font-semibold mb-4">Ventes (14j)</h2>
      <Line data={data} options={{ plugins: { legend: { display: false } } }} />
    </section>
  );
}
