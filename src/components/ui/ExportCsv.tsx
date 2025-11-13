"use client";
import React from "react";

type Row = { date: string; yhat: number; p10: number; p90: number };

export default function ExportCsv({ rows, filename }: { rows: Row[]; filename?: string }) {
  const onClick = () => {
    const header = ["date","p10","p50","p90"]; 
    const lines = [header.join(",")].concat(
      rows.map(r => [r.date, r.p10, r.yhat, r.p90].map(v => String(v)).join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `forecast-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button onClick={onClick} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">Exporter CSV</button>
  );
}
