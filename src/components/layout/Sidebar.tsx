"use client";
import Link from "next/link";
import { BarChart3, MessageSquare } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/spyscope", label: "SpyScope", icon: BarChart3 },
  { href: "/forecast", label: "Forecast", icon: BarChart3 },
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
      {/* Section supprimée: Accès rapide BFF */}
    </aside>
  );
}
