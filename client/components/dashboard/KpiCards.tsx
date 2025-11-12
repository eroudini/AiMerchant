export default function KpiCards({ data }: { data: { gmv: number; net_margin: number; units: number; aov: number } }) {
  const items = [
    { label: "CHIFFRE D'AFFAIRES 30J", value: data.gmv, fmt: (v: number) => Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v) },
    { label: 'COMMANDES 30J', value: data.units, fmt: (v: number) => Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v) },
    { label: 'MARGE %', value: data.gmv > 0 ? (data.net_margin / Math.max(1, data.gmv)) * 100 : 0, fmt: (v: number) => `${Math.round(v)}%` },
    { label: 'ALERTES', value: 0, fmt: (v: number) => String(v) },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-xl border border-white/10 bg-neutral-900/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur supports-[backdrop-filter]:bg-neutral-900/40"
        >
          <div className="text-[11px] uppercase tracking-wider text-neutral-400">{it.label}</div>
          <div className="mt-2 text-3xl font-semibold text-white">{it.fmt(it.value || 0)}</div>
        </div>
      ))}
    </div>
  );
}
