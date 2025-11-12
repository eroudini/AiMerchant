const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
type Item = { category: string; avg_price: number; delta_pct: number; revenue: number; units: number };

function deltaColor(pct: number) {
  if (pct > 5) return 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30';
  if (pct < -5) return 'bg-rose-500/20 text-rose-300 ring-rose-500/30';
  return 'bg-neutral-500/10 text-neutral-300 ring-white/10';
}

export default function MarketHeatmap({ rows, country = 'FR' }: { rows: Item[]; country?: string }) {
  const items = (rows || []).slice(0, 12);
  const exportHref = `${API_BASE}/bff/export/csv?resource=market_heatmap&period=last_7d&country=${encodeURIComponent(country)}`;
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/60 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur supports-[backdrop-filter]:bg-neutral-900/40">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-medium text-white/90">Heatmap marché — Prix moyen & tendance</h2>
        <div className="flex items-center gap-3">
          <a href={exportHref} className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs text-neutral-300 hover:border-amber-500/30">Télécharger CSV</a>
          <span className="text-xs text-neutral-400">Top 12 catégories — 7 jours</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
        {items.map((it) => (
          <div key={it.category} className="rounded-lg border border-white/10 p-3">
            <div className="text-xs text-neutral-400 truncate" title={it.category}>{it.category}</div>
            <div className="mt-2 text-lg font-semibold text-white">{Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(it.avg_price || 0)}</div>
            <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1 ${deltaColor(it.delta_pct)}`}>
              <span>{it.delta_pct >= 0 ? '+' : ''}{Math.round(it.delta_pct)}%</span>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-sm text-neutral-500">Aucune donnée pour la période</div>
        )}
      </div>
    </div>
  );
}
