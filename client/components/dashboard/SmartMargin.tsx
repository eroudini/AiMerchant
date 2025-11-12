"use client";
import { useEffect, useMemo, useState } from 'react';
import { getPricingSimulate } from '../../lib/bff';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function SmartMarginCard({ defaultSku, country }: { defaultSku?: string; country?: string }) {
  const [sku, setSku] = useState<string>(defaultSku || 'SKU-001');
  const [delta, setDelta] = useState<number>(-5);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [buy, setBuy] = useState<number>(0);
  const [fees, setFees] = useState<number>(0);
  const [suggest, setSuggest] = useState<any>(null);
  const [applyStatus, setApplyStatus] = useState<string| null>(null);

  async function run() {
    setLoading(true); setError(null);
    try {
      const res = await getPricingSimulate({ sku, delta, country });
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'Erreur');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { run(); /* run on mount */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmt = useMemo(() => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }), []);
  const callSuggest = async () => {
    setSuggest(null); setApplyStatus(null);
    try {
      const url = new URL(`${API_BASE}/bff/pricing/suggest`);
      url.searchParams.set('sku', sku);
      url.searchParams.set('target', '0.2');
      url.searchParams.set('clamp', '0.05');
      url.searchParams.set('buy', String(buy||0));
      url.searchParams.set('fees', String(fees||0));
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) throw new Error('Suggest failed');
      const j = await res.json();
      setSuggest(j);
    } catch (e:any) { setError(e?.message||'Erreur'); }
  };
  const applyNewPrice = async () => {
    if (!suggest?.suggested) return;
    setApplyStatus('pending');
    try {
      const res = await fetch(`${API_BASE}/bff/pricing/apply`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sku, new_price: suggest.suggested, note: 'SmartMargin v1' }) });
      if (!res.ok) throw new Error('Apply failed');
      const j = await res.json();
      setApplyStatus(`envoyé (#${j.id})`);
    } catch (e:any) { setApplyStatus('erreur'); }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/60 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur supports-[backdrop-filter]:bg-neutral-900/40">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-medium text-white/90">SmartMargin — Simulation de prix</h2>
        <span className="text-xs text-neutral-400">Elasticité simple</span>
      </div>
      <div className="px-4 py-3 grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="text-xs text-neutral-400">SKU</label>
          <input value={sku} onChange={(e)=>setSku(e.target.value)} className="mt-1 w-full rounded-md bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-amber-500/40" placeholder="product_code" />
        </div>
        <div className="sm:col-span-1">
          <label className="text-xs text-neutral-400">Delta prix (%)</label>
          <div className="mt-1 flex items-center gap-2">
            <button onClick={()=>setDelta(d=>Math.max(-50, d-5))} className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs text-white hover:border-amber-500/30">-5%</button>
            <input type="number" value={delta} onChange={(e)=>setDelta(Number(e.target.value))} className="w-20 rounded-md bg-black/40 px-2 py-1 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-amber-500/40" />
            <button onClick={()=>setDelta(d=>Math.min(50, d+5))} className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs text-white hover:border-amber-500/30">+5%</button>
            <button onClick={run} className="ml-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300 hover:bg-amber-500/20">Simuler</button>
          </div>
        </div>
        <div className="sm:col-span-1">
          <label className="text-xs text-neutral-400">Résultat</label>
          <div className="mt-1 text-sm text-white/90 min-h-[2.5rem] flex items-center">
            {loading ? 'Calcul...' : error ? <span className="text-rose-300">{error}</span> : data ? (
              <div className="space-y-0.5">
                <div>{data.product_name || data.sku}</div>
                <div className="text-xs text-neutral-400">Recette 7j: {fmt.format(data.base_revenue_7d||0)} → {fmt.format(data.new_revenue_7d||0)} ({data.uplift_revenue_pct>=0?'+':''}{Math.round(data.uplift_revenue_pct)}%)</div>
              </div>
            ) : <span className="text-neutral-400">Aucune donnée</span>}
          </div>
        </div>
        <div className="sm:col-span-1">
          <label className="text-xs text-neutral-400">Coûts (achat + frais)</label>
          <div className="mt-1 flex items-center gap-2">
            <input type="number" placeholder="Achat" value={buy} onChange={(e)=>setBuy(Number(e.target.value))} className="w-24 rounded-md bg-black/40 px-2 py-1 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-amber-500/40" />
            <input type="number" placeholder="Frais" value={fees} onChange={(e)=>setFees(Number(e.target.value))} className="w-24 rounded-md bg-black/40 px-2 py-1 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-amber-500/40" />
            <button onClick={callSuggest} className="ml-2 rounded-md border border-white/10 bg-black/40 px-3 py-1 text-xs text-neutral-300 hover:border-amber-500/30">Suggérer</button>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-neutral-400">Suggestion</label>
          <div className="mt-1 text-xs text-neutral-300 min-h-[2.5rem] flex items-center justify-between">
            {suggest ? (
              <>
                <div>
                  Candidat: {fmt.format(suggest.candidate)} {suggest.competitor_price!=null && <span className="text-neutral-500">• Concurrence moy.: {fmt.format(suggest.competitor_price)}</span>} → Suggéré: <span className="text-white/90">{fmt.format(suggest.suggested)}</span>
                </div>
                <button onClick={applyNewPrice} className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20">Appliquer</button>
              </>
            ) : <span className="text-neutral-500">Renseignez les coûts puis cliquez “Suggérer”.</span>}
          </div>
          {applyStatus && <div className="mt-1 text-xs text-neutral-400">Statut: {applyStatus}</div>}
        </div>
      </div>
    </div>
  );
}
