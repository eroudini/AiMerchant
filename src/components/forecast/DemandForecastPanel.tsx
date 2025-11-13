"use client";
import { useState } from "react";
import { toast } from "sonner";

type Chip = { label: string; deltaPct: number };

type SeriesRow = { date: string; yhat: number; p10?: number; p90?: number };

export default function DemandForecastPanel(props: {
  title: string;
  daysAhead: number;
  countryChips: Chip[];
  categoryChips?: Chip[];
  avoidedStockouts7d?: number;
  series: SeriesRow[];
  showBand?: boolean;
  // Right panel (priority action)
  productName: string;
  productId: string;
  countryCode: string;
  channelCode: string;
  growthDeltaPct: number; // expected growth over window
  confidence01: number; // 0..1
  stockDays?: number | null;
  leadDays?: number | null;
  reasons?: string[]; // tags
  poQty?: number | null;
  detailsHref?: string;
  // Declining product block
  decliningName?: string;
  decliningDeltaPct?: number;
  decliningNote?: string;
}) {
  const {
    title,
    daysAhead,
    countryChips,
    categoryChips = [],
    avoidedStockouts7d = 0,
    series,
    showBand = false,
    productName,
    productId,
    countryCode,
    channelCode,
    growthDeltaPct,
    confidence01,
    stockDays,
    leadDays,
    reasons = [],
    poQty,
    detailsHref = '#',
    decliningName,
    decliningDeltaPct,
    decliningNote,
  } = props;

  function pct(v: number | undefined | null) {
    if (v == null || !isFinite(v)) return '—';
    const r = Math.round(v);
    return (r >= 0 ? '+' : '') + r + '%';
  }

  // small confidence bar width
  const confPct = Math.max(0, Math.min(100, Math.round((confidence01 || 0) * 100)));

  const [submitting, setSubmitting] = useState(false);

  async function handleCreatePo() {
    try {
      setSubmitting(true);
      const qty = Math.max(0, Number(poQty ?? 0));
      if (!qty) {
        toast.info("Aucune quantité suggérée. Ajustez d'abord l'horizon ou le stock.");
        return;
      }
      const base = process.env.NEXT_PUBLIC_BFF_URL || process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const res = await fetch(`${base}/bff/actions/po`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          qty,
          country: countryCode,
          channel: channelCode,
          note: `PO auto-suggérée depuis forecast (${daysAhead}j)`
        }),
      });
      if (!res.ok) {
        const msg = res.status === 401 ? 'Non authentifié' : res.status === 403 ? 'Accès refusé (admin requis)' : 'Erreur serveur';
        toast.error(`Échec création PO: ${msg}`);
        return;
      }
      const data = await res.json();
      toast.success(`Brouillon PO créé (#${data.id || '…'})`);
    } catch (e: any) {
      toast.error(`Erreur: ${e?.message || 'inconnue'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header cards */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white/90">{title} — {daysAhead} jours</h1>
          <p className="text-xs text-neutral-400">Prédisez la demande et déclenchez des actions pour maximiser la marge et éviter les ruptures.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-neutral-400">Tendance {countryChips[0]?.label || 'Pays'}</div>
          <div className="text-lg font-semibold mt-1">
            <span className={`${(countryChips[0]?.deltaPct ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{pct(countryChips[0]?.deltaPct)}</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Prévision {daysAhead}j</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-neutral-400">Catégorie la plus haussière</div>
          <div className="text-lg font-semibold mt-1">
            <span className={`${(categoryChips[0]?.deltaPct ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{pct(categoryChips[0]?.deltaPct)}</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">{categoryChips[0]?.label || '—'}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-neutral-400">Ruptures évitées</div>
          <div className="text-lg font-semibold mt-1 text-white/90">{avoidedStockouts7d}</div>
          <div className="text-[11px] text-neutral-500 mt-1">7 derniers jours</div>
        </div>
      </div>

      {/* Chips row */}
      <div className="flex flex-wrap gap-2">
        {countryChips.slice(0, 4).map((c) => (
          <span key={c.label} className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] ${c.deltaPct>=0? 'text-emerald-300 bg-emerald-500/10' : 'text-rose-300 bg-rose-500/10'}`}>{c.label} <b>{pct(c.deltaPct)}</b></span>
        ))}
        {categoryChips.slice(0, 4).map((c) => (
          <span key={c.label} className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] ${c.deltaPct>=0? 'text-emerald-300 bg-emerald-500/10' : 'text-rose-300 bg-rose-500/10'}`}>{c.label} <b>{pct(c.deltaPct)}</b></span>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Aggregated chart */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
          <div className="text-sm text-white/80 mb-2">Prévision agrégée (p50) — intervalle indicatif</div>
          {/* Consumer passes the chart component; keep slot area */}
          <div>{/* Chart slot rendered by parent */}</div>
        </div>

        {/* Priority product action */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="text-sm font-semibold text-white/90">Produits à action prioritaire</div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white/90">{productName}</div>
            <div className={`text-xs ${growthDeltaPct>=0? 'text-emerald-400' : 'text-rose-400'}`}>{pct(growthDeltaPct)}</div>
            <div className="text-[11px] text-neutral-400">Confiance modèle</div>
            <div className="h-2 w-full rounded bg-white/10 overflow-hidden"><div className="h-2 bg-white/70" style={{ width: confPct+'%' }} /></div>
            <div className="text-[11px] text-neutral-400">Stock (jours) / Lead time</div>
            <div className="text-xs text-white/80">{stockDays!=null? Math.round(stockDays): '—'}j / {leadDays!=null? Math.round(leadDays): '—'}j</div>
            <div className="flex flex-wrap gap-2">
              {reasons.map((r)=> (
                <span key={r} className="inline-flex rounded-full border border-white/10 px-2 py-1 text-[11px] text-neutral-300">{r}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <a href={detailsHref} className="rounded-md border border-white/15 px-3 py-2 text-xs hover:bg-white/10">Voir détails</a>
              <button onClick={handleCreatePo} disabled={submitting} className="rounded-md bg-blue-600/90 px-3 py-2 text-xs text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Envoi…' : `PO ${poQty!=null? poQty: 0}`}
              </button>
              <button className="rounded-md border border-white/15 px-3 py-2 text-xs hover:bg-white/10">Programmer</button>
            </div>
          </div>

          {/* Declining product */}
          {decliningName && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <div className="text-sm font-semibold text-white/90">{decliningName}</div>
              <div className={`text-xs ${((decliningDeltaPct||0)>=0)? 'text-emerald-400' : 'text-rose-400'}`}>{pct(decliningDeltaPct ?? 0)}</div>
              <div className="text-xs text-neutral-400">{decliningNote}</div>
            </div>
          )}
        </div>
      </div>

      {/* Auto-Action Center (static MVP) */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white/90 mb-3">Auto-Action Center</div>
        <div className="divide-y divide-white/10">
          <div className="py-3 grid grid-cols-5 items-center text-sm">
            <div className="col-span-2">Réassort automatique</div>
            <div className="text-xs text-neutral-400">Si stock &lt; 15j et pic prévu</div>
            <div className="text-xs">Actif</div>
            <div className="text-right"><button className="rounded-md border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10">Modifier</button></div>
          </div>
          <div className="py-3 grid grid-cols-5 items-center text-sm">
            <div className="col-span-2">Prix dynamique</div>
            <div className="text-xs text-neutral-400">Si marge &gt; 10% et demande ↑</div>
            <div className="text-xs">En test</div>
            <div className="text-right"><button className="rounded-md border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10">Modifier</button></div>
          </div>
          <div className="py-3 grid grid-cols-5 items-center text-sm">
            <div className="col-span-2">Campagne Ads</div>
            <div className="text-xs text-neutral-400">Si demande ↑ &gt; 50%</div>
            <div className="text-xs">Désactivé</div>
            <div className="text-right"><button className="rounded-md border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10">Modifier</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}
