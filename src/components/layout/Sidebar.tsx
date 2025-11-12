"use client";
import Link from "next/link";
import { BarChart3, MessageSquare } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/spyscope", label: "SpyScope", icon: BarChart3 },
  { href: "/app/copilot", label: "AiChat", icon: MessageSquare },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r border-white/10 bg-neutral-950 min-h-screen p-4 gap-4 text-white">
      <div className="font-bold text-lg">AIMerchant</div>
      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10"
            >
              <Icon className="w-4 h-4" /> {item.label}
            </Link>
          );
        })}
      </nav>
      {/* Accès rapide BFF */}
      <div className="mt-4 border-t border-white/10 pt-3">
        <div className="mb-2 text-[11px] uppercase tracking-wide text-neutral-400">Accès rapide BFF</div>
        <div className="flex flex-col gap-2 text-xs">
          <a href={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/bff/kpi/overview?period=last_7d`} target="_blank" className="rounded-md border border-white/10 px-3 py-2 hover:border-amber-500/30">KPIs 7j</a>
          <a href={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/bff/competitors/diff?period=last_7d`} target="_blank" className="rounded-md border border-white/10 px-3 py-2 hover:border-amber-500/30">Concurrence 7j</a>
          <a href={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/bff/market/heatmap?period=last_7d`} target="_blank" className="rounded-md border border-white/10 px-3 py-2 hover:border-amber-500/30">Heatmap marché</a>
          <a href={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/bff/alerts/movements?period=last_7d`} target="_blank" className="rounded-md border border-white/10 px-3 py-2 hover:border-amber-500/30">Alertes 7j</a>
          <a href={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/bff/radar/trends?period=last_30d&type=product`} target="_blank" className="rounded-md border border-white/10 px-3 py-2 hover:border-amber-500/30">Radar produits</a>
          <a href={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/bff/pricing/simulate?sku=DEMO&delta=5`} target="_blank" className="rounded-md border border-white/10 px-3 py-2 hover:border-amber-500/30">Pricing simulate</a>
          <a href={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/bff/pricing/suggest?sku=DEMO&buy=10&fees=2&target=0.2&clamp=0.05`} target="_blank" className="rounded-md border border-white/10 px-3 py-2 hover:border-amber-500/30">Pricing suggest</a>
        </div>
      </div>
    </aside>
  );
}
