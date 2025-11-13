"use client";
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

type Row = { date: string; yhat: number; p10?: number; p90?: number };

export default function Sparkline({ rows, height = 80, showBand = false }: { rows: Row[]; height?: number; showBand?: boolean }) {
  const labels = rows.map((r) => r.date.slice(5));
  const datasets: any[] = [];
  if (showBand) {
    const hasBand = rows.every(r => typeof r.p10 === 'number' && typeof r.p90 === 'number');
    if (hasBand) {
      datasets.push({
        label: "p90",
        data: rows.map(r => r.p90 as number),
        borderColor: "rgba(56,189,248,0)",
        backgroundColor: "rgba(56,189,248,0)",
        pointRadius: 0,
        borderWidth: 0,
        tension: 0.3,
        fill: false,
      });
      datasets.push({
        label: "p10-p90",
        data: rows.map(r => r.p10 as number),
        borderColor: "rgba(56,189,248,0)",
        backgroundColor: "rgba(56,189,248,0.12)",
        pointRadius: 0,
        borderWidth: 0,
        tension: 0.3,
        fill: "-1",
      });
    }
  }
  datasets.push({
    label: "Prévision",
    data: rows.map((r) => r.yhat),
    borderColor: "rgb(56,189,248)",
    backgroundColor: "rgba(56,189,248,0.2)",
    pointRadius: 0,
    borderWidth: 2,
    tension: 0.3,
    fill: false,
  });
  const data = { labels, datasets };
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#9CA3AF", maxTicksLimit: 8 } },
      y: { grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#9CA3AF" } },
    },
  };
  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
}
