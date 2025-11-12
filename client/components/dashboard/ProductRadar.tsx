"use client";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
type Trend = { kind: 'category'|'product'; id: string; name?: string|null; category?: string|null; revenue_cur: number; revenue_prev: number; growth_pct: number; units_cur: number };

function badge(delta: number) {
  if (delta > 10) return 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30';
  if (delta < -10) return 'bg-rose-500/20 text-rose-300 ring-rose-500/30';
  return 'bg-neutral-500/10 text-neutral-300 ring-white/10';
}

import { useMemo, useState } from 'react';

export default function ProductRadar({ rowsProduct, rowsCategory, defaultType = 'product', country = 'FR', period = 'last_30d' }: { rowsProduct: Trend[]; rowsCategory: Trend[]; defaultType?: 'product'|'category'; country?: string; period?: 'last_30d'|'last_90d' }) {
  const [type, setType] = useState<'product'|'category'>(defaultType);
  const items = (type === 'product' ? (rowsProduct || []) : (rowsCategory || []));
  const up = useMemo(() => items.filter(i => i.growth_pct >= 0).sort((a,b)=>b.growth_pct-a.growth_pct).slice(0,4), [items]);
  const down = useMemo(() => items.filter(i => i.growth_pct < 0).sort((a,b)=>a.growth_pct-b.growth_pct).slice(0,4), [items]);
  const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const exportHref = `${API_BASE}/bff/export/csv?resource=radar_trends&period=${period}&type=${type}&country=${encodeURIComponent(country)}&limit=100`;
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/60 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur supports-[backdrop-filter]:bg-neutral-900/40">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-medium text-white/90">ProductRadar — Tendances</h2>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/20 p-1 text-xs text-neutral-300">
            <button onClick={()=>setType('product')} className={`px-2 py-0.5 rounded ${type==='product'?'bg-white/10 text-white':''}`}>Produit</button>
            <button onClick={()=>setType('category')} className={`px-2 py-0.5 rounded ${type==='category'?'bg-white/10 text-white':''}`}>Catégorie</button>
          </div>
          <a href={exportHref} className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs text-neutral-300 hover:border-amber-500/30">Télécharger CSV</a>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
        <div>
          <div className="mb-2 text-xs text-neutral-400">En hausse</div>
          {up.map((t) => (
            <div key={`up-${t.kind}-${t.id}`} className="mb-2 rounded-lg border border-white/10 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-white/90" title={t.name || t.id}>{t.name || t.id}</div>
                  <div className="text-xs text-neutral-400">{t.kind === 'product' ? (t.category || '—') : 'Catégorie'}</div>
                </div>
                <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1 ${badge(t.growth_pct)}`}>
                  +{Math.round(t.growth_pct)}%
                </div>
              </div>
              <div className="mt-2 text-xs text-neutral-400">Recette: {fmt.format(t.revenue_prev)} → <span className="text-white/90">{fmt.format(t.revenue_cur)}</span></div>
            </div>
          ))}
          {up.length === 0 && <div className="text-sm text-neutral-500">—</div>}
        </div>
        <div>
          <div className="mb-2 text-xs text-neutral-400">En baisse</div>
          {down.map((t) => (
            <div key={`down-${t.kind}-${t.id}`} className="mb-2 rounded-lg border border-white/10 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-white/90" title={t.name || t.id}>{t.name || t.id}</div>
                  <div className="text-xs text-neutral-400">{t.kind === 'product' ? (t.category || '—') : 'Catégorie'}</div>
                </div>
                <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1 ${badge(t.growth_pct)}`}>
                  {Math.round(t.growth_pct)}%
                </div>
              </div>
              <div className="mt-2 text-xs text-neutral-400">Recette: {fmt.format(t.revenue_prev)} → <span className="text-white/90">{fmt.format(t.revenue_cur)}</span></div>
            </div>
          ))}
          {down.length === 0 && <div className="text-sm text-neutral-500">—</div>}
        </div>
      </div>
    </div>
  );
}
