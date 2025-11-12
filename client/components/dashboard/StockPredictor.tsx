"use client";
import { useEffect, useMemo, useState } from 'react';
import { getStockPredict } from '../../lib/bff';

export default function StockPredictorCard({ defaultProduct, country, defaultLeadDays = 7 }: { defaultProduct?: string; country?: string; defaultLeadDays?: number }) {
  const [product, setProduct] = useState<string>(defaultProduct || 'SKU-001');
  const [leadDays, setLeadDays] = useState<number>(defaultLeadDays);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null);
    try {
      const res = await getStockPredict({ product, lead_days: leadDays, country });
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'Erreur');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { run(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmt = useMemo(() => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }), []);
  const dfmt = useMemo(() => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }), []);

  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/60 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur supports-[backdrop-filter]:bg-neutral-900/40">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-medium text-white/90">StockPredictor — Rupture estimée</h2>
        <span className="text-xs text-neutral-400">7j glissants</span>
      </div>
      <div className="px-4 py-3 grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="text-xs text-neutral-400">Produit (SKU)</label>
          <input value={product} onChange={(e)=>setProduct(e.target.value)} className="mt-1 w-full rounded-md bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-amber-500/40" placeholder="product_code" />
        </div>
        <div className="sm:col-span-1">
          <label className="text-xs text-neutral-400">Lead time (jours)</label>
          <div className="mt-1 flex items-center gap-2">
            <button onClick={()=>setLeadDays(d=>Math.max(1, d-1))} className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs text-white hover:border-amber-500/30">-1</button>
            <input type="number" value={leadDays} onChange={(e)=>setLeadDays(Number(e.target.value))} className="w-20 rounded-md bg-black/40 px-2 py-1 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-amber-500/40" />
            <button onClick={()=>setLeadDays(d=>d+1)} className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs text-white hover:border-amber-500/30">+1</button>
            <button onClick={run} className="ml-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300 hover:bg-amber-500/20">Calculer</button>
          </div>
        </div>
        <div className="sm:col-span-1">
          <label className="text-xs text-neutral-400">Résultat</label>
          <div className="mt-1 text-sm text-white/90 min-h-[2.5rem] flex items-center">
            {loading ? 'Calcul...' : error ? <span className="text-rose-300">{error}</span> : data ? (
              <div className="space-y-0.5">
                <div>Stock actuel: {data.stock_current != null ? fmt.format(data.stock_current) : '-'} • Vente/jour: {data.avg_daily_sales != null ? fmt.format(Math.round(data.avg_daily_sales)) : '-'}</div>
                <div className="text-xs text-neutral-400">Rupture estimée: {data.predicted_stockout_date ? dfmt.format(new Date(data.predicted_stockout_date)) : '—'} • Reco réassort ({data.lead_days}j): {data.suggested_reorder_qty != null ? fmt.format(data.suggested_reorder_qty) : '-'}</div>
              </div>
            ) : <span className="text-neutral-400">Aucune donnée</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
