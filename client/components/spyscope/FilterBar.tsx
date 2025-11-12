"use client";
import { useRouter, useSearchParams } from "next/navigation";

const PERIODS = [
  { value: "last_7d", label: "7 jours" },
  { value: "last_30d", label: "30 jours" },
  { value: "last_90d", label: "90 jours" },
] as const;

const COUNTRIES = [
  { value: "FR", label: "France" },
  { value: "DE", label: "Allemagne" },
  { value: "ES", label: "Espagne" },
  { value: "IT", label: "Italie" },
  { value: "UK", label: "Royaume-Uni" },
] as const;

export default function FilterBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const period = sp.get("period") || "last_7d";
  const country = sp.get("country") || "FR";
  const category = sp.get("category") || "";

  const onChange = (next: { period?: string; country?: string; category?: string }) => {
    const url = new URL(window.location.href);
    if (next.period) url.searchParams.set("period", next.period);
    if (next.country) url.searchParams.set("country", next.country);
    if (next.category !== undefined) {
      const v = (next.category || '').trim();
      if (v) url.searchParams.set("category", v); else url.searchParams.delete("category");
    }
    router.push(url.pathname + "?" + url.searchParams.toString());
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <div className="flex items-center">
        <label className="mr-2 text-xs text-neutral-400">Période</label>
        <select
          value={period}
          onChange={(e) => onChange({ period: e.target.value })}
          className="rounded-md bg-black/40 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-amber-500/40"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center">
        <label className="mr-2 text-xs text-neutral-400">Pays</label>
        <select
          value={country}
          onChange={(e) => onChange({ country: e.target.value })}
          className="rounded-md bg-black/40 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-amber-500/40"
        >
          {COUNTRIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center">
        <label className="mr-2 text-xs text-neutral-400">Catégorie</label>
        <input
          value={category}
          onChange={(e) => onChange({ category: e.target.value })}
          placeholder="ex: Smartphones"
          className="w-64 rounded-md bg-black/40 px-3 py-2 outline-none ring-1 ring-white/10 placeholder:text-neutral-500 focus:ring-amber-500/40"
        />
      </div>
    </div>
  );
}
