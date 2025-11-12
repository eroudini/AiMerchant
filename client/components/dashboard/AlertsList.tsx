type Alert = { type: 'price'|'stock'; product_code: string; product_name?: string|null; category?: string|null; delta_pct: number; current: number; previous: number };

function badge(type: 'price'|'stock', delta: number) {
  const isUp = delta > 0;
  const base = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1';
  if (type === 'price') return `${base} ${isUp ? 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30' : 'bg-rose-500/20 text-rose-300 ring-rose-500/30'}`;
  return `${base} ${isUp ? 'bg-sky-500/20 text-sky-300 ring-sky-500/30' : 'bg-amber-500/20 text-amber-300 ring-amber-500/30'}`;
}

export default function AlertsList({ rows }: { rows: Alert[] }) {
  const items = rows || [];
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/60 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur supports-[backdrop-filter]:bg-neutral-900/40">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-medium text-white/90">Alertes — Mouvements prix & stock</h2>
        <span className="text-xs text-neutral-400">Derniers 7 jours</span>
      </div>
      <div className="divide-y divide-white/10">
        {items.slice(0, 12).map((a) => {
          const label = a.type === 'price' ? 'prix' : 'stock';
          const updown = a.delta_pct >= 0 ? 'augmenté' : 'baissé';
          const name = a.product_name || a.product_code;
          return (
            <div key={`${a.type}-${a.product_code}`} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm text-white/90" title={`${name}`}>{name}</div>
                <div className="mt-0.5 text-xs text-neutral-400">
                  {`Le ${label} a ${updown} de ${Math.round(Math.abs(a.delta_pct))}%`} {a.category ? `• ${a.category}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={badge(a.type, a.delta_pct)}>{a.delta_pct >= 0 ? '+' : ''}{Math.round(a.delta_pct)}%</span>
                <div className="text-right">
                  <div className="text-xs text-neutral-400">Actuel</div>
                  <div className="text-sm font-medium text-white">{Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(a.current)}</div>
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="px-4 py-6 text-sm text-neutral-500">Aucune alerte sur la période</div>
        )}
      </div>
    </div>
  );
}
