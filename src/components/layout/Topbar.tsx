"use client";
import { Bell, User, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-neutral-900/60 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/40">
      <div className="container-responsive h-14 flex items-center justify-between text-white">
        <Link href="/" className="font-semibold flex items-center gap-2">
          AIMerchant
          <span className="hidden md:inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[color:var(--brand)]/15 text-[color:var(--brand)] border border-[color:var(--brand)]/30">
            <Sparkles className="w-3 h-3" /> IA activée
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button aria-label="Notifications" className="rounded-xl p-2 hover:bg-white/10">
            <Bell className="w-5 h-5" />
          </button>
          <Link href="/app/account" className="rounded-full p-2 hover:bg-white/10" aria-label="Compte">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
