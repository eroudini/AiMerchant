"use client";
import React from "react";
import { Bell } from "lucide-react";
import { alerts } from "@/data/mock";

export default function AlertsListSection() {
  return (
    <section className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-[color:var(--brand)]" />
        <h2 className="font-semibold">Alertes</h2>
      </div>
      <ul className="space-y-2 text-sm">
        {alerts.map((a) => (
          <li key={a.at} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex flex-col">
              <span className="font-medium text-white/90">{a.type === "LOW_STOCK" ? "Stock bas" : "Marge faible"}</span>
              <span className="text-neutral-300">{a.message}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${a.type === "LOW_STOCK" ? "bg-amber-400/15 text-amber-200" : "bg-red-400/15 text-red-200"}`}>{a.type}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
