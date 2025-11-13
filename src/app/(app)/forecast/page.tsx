import { cookies } from "next/headers";
import ExportCsv from "@/components/ui/ExportCsv";
import CopyLinkButton from "@/components/ui/CopyLinkButton";
import Sparkline from "@/components/forecast/Sparkline";
import DemandForecastPanel from "@/components/forecast/DemandForecastPanel";

async function fetchForecast(searchParams: Record<string,string|undefined>) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c: any) => `${c.name}=${c.value}`).join('; ');
  const productId = searchParams.productId || 'csv';
  const country = searchParams.country || 'FR';
  const channel = searchParams.channel || 'AMAZON';
  const horizon = searchParams.h || '30';
  const qs = new URLSearchParams({ productId, country, channel, horizon }).toString();
  const base = process.env.NEXT_PUBLIC_BFF_URL 
    || process.env.NEXT_PUBLIC_API_BASE 
    || process.env.NEXT_PUBLIC_API_BASE_URL 
    || 'http://localhost:4000';
  try {
    const res = await fetch(`${base}/bff/forecast/demand?` + qs, { headers: { cookie: cookieHeader } });
    if (!res.ok) {
      return { series: [], source: `error:${res.status}` };
    }
    return await res.json();
  } catch {
    return { series: [], source: 'error:fetch' };
  }
}

async function fetchStockPredict(productId: string, country: string|undefined, leadDays: number, cookieHeader: string, base: string) {
  const params = new URLSearchParams({ product: productId, ...(country? { country }: {}), lead_days: String(leadDays) }).toString();
  try {
    const res = await fetch(`${base}/bff/stock/predict?` + params, { headers: { cookie: cookieHeader } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchSurge(searchParams: Record<string,string|undefined>) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c: any) => `${c.name}=${c.value}`).join('; ');
  const productId = searchParams.productId || 'csv';
  const country = searchParams.country || 'FR';
  const channel = searchParams.channel || 'AMAZON';
  const windowDays = searchParams.win || searchParams.window || '14';
  const top = searchParams.top || '5';
  const qs = new URLSearchParams({ productId, country, channel, window: windowDays, top }).toString();
  const base = process.env.NEXT_PUBLIC_BFF_URL 
    || process.env.NEXT_PUBLIC_API_BASE 
    || process.env.NEXT_PUBLIC_API_BASE_URL 
    || 'http://localhost:4000';
  try {
    const res = await fetch(`${base}/bff/forecast/surge?` + qs, { headers: { cookie: cookieHeader } });
    if (!res.ok) return { window: Number(windowDays), runId: null, points: [], summary: { max_delta_pct: 0, max_date: null } };
    return res.json();
  } catch {
    return { window: Number(windowDays), runId: null, points: [], summary: { max_delta_pct: 0, max_date: null } };
  }
}

export default async function ForecastPage({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const sp = searchParams ? await searchParams : {} as Record<string,string>;
  const data = await fetchForecast(sp);
  const series: { date: string; yhat: number; p10?: number; p90?: number }[] = Array.isArray((data as any).series) ? (data as any).series : [];
  const productId = sp.productId || 'csv';
  const country = sp.country || 'FR';
  const channel = sp.channel || 'AMAZON';
  const horizonStr = sp.h || '30';
  const horizon = Number(horizonStr) || 30;
  const showBand = sp.band === '1' || sp.showBand === '1' ? true : false;
  const surge = await fetchSurge(sp);
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c: any) => `${c.name}=${c.value}`).join('; ');
  const base = process.env.NEXT_PUBLIC_BFF_URL 
    || process.env.NEXT_PUBLIC_API_BASE 
    || process.env.NEXT_PUBLIC_API_BASE_URL 
    || 'http://localhost:4000';
  const stock = await fetchStockPredict(productId, country, horizon, cookieHeader, base);

  // Compute UX summary metrics from p50 (yhat)
  const p50 = series.map((r) => Number(r.yhat) || 0);
  const p50Sorted = [...p50].sort((a,b)=>a-b);
  const p50Min = p50.length ? p50Sorted[0] : null;
  const p50Max = p50.length ? p50Sorted[p50Sorted.length-1] : null;
  const p50Median = p50.length ? (p50Sorted.length % 2 === 1 ? p50Sorted[(p50Sorted.length-1)/2] : (p50Sorted[p50Sorted.length/2 - 1] + p50Sorted[p50Sorted.length/2]) / 2) : null;
  function avg(arr: number[]) { return arr.length ? arr.reduce((s,x)=>s+x,0)/arr.length : 0; }
  function deltaPct(cur: number, prev: number) { if (!isFinite(prev) || Math.abs(prev) < 1e-9) return null; return (cur - prev) / prev * 100; }
  let d7: number|null = null, d14: number|null = null;
  if (p50.length >= 14) {
    d7 = deltaPct(avg(p50.slice(-7)), avg(p50.slice(-14,-7)));
  }
  if (p50.length >= 28) {
    d14 = deltaPct(avg(p50.slice(-14)), avg(p50.slice(-28,-14)));
  }

  // Helper to compute growth over horizon (avg last 7 vs first 7 days)
  function growthPctOverHorizon(vals: number[]): number|null {
    if (!vals || vals.length < 8) return null;
    const first = avg(vals.slice(0, Math.min(7, Math.floor(vals.length/2))));
    const last = avg(vals.slice(-Math.min(7, Math.floor(vals.length/2))));
    if (!isFinite(first) || Math.abs(first) < 1e-9) return null;
    return ((last - first) / first) * 100;
  }

  // Countries growth (simple demo: compute for FR/DE/ES by reusing current product/channel)
  async function computeCountryDelta(label: string, ctry: string) {
    const obj = await fetchForecast({ ...sp, country: ctry });
    const arr = Array.isArray((obj as any).series) ? (obj as any).series.map((r: any)=>Number(r.yhat)||0) : [];
    const g = growthPctOverHorizon(arr);
    return { label, deltaPct: g == null ? 0 : g };
  }

  const countriesList = await Promise.all([
    computeCountryDelta('France', 'FR'),
    computeCountryDelta('Allemagne', 'DE'),
    computeCountryDelta('Espagne', 'ES'),
  ]);

  // Category chips from radar trends (server BFF)
  async function fetchCategoryChips(ctry: string) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c: any) => `${c.name}=${c.value}`).join('; ');
    const params = new URLSearchParams({ period: 'last_30d', type: 'category', country: ctry, limit: '8' }).toString();
    const base = process.env.NEXT_PUBLIC_BFF_URL 
      || process.env.NEXT_PUBLIC_API_BASE 
      || process.env.NEXT_PUBLIC_API_BASE_URL 
      || 'http://localhost:4000';
    try {
      const res = await fetch(`${base}/bff/radar/trends?` + params, { headers: { cookie: cookieHeader } });
      if (!res.ok) return [] as any[];
      const rows = await res.json();
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [] as any[];
    }
  }
  const radarCats = await fetchCategoryChips(country);
  const categoryChips = radarCats
    .filter((r: any) => typeof r.growth_pct === 'number')
    .sort((a: any,b: any)=> (b.growth_pct||0) - (a.growth_pct||0))
    .slice(0,4)
    .map((r: any) => ({ label: r.id || r.name || 'Catégorie', deltaPct: Math.round(r.growth_pct) }));

  // High demand and declining summaries from current series
  const growthCurrent = growthPctOverHorizon(p50) ?? 0;
  // find max positive surge day (from surge.points if any) and min negative from series deltas
  const maxSurge = Array.isArray((surge as any).points) && (surge as any).points.length ? (surge as any).points[0] : null;
  const deltasDay: Array<{ date: string; delta_pct: number; yhat: number }> = [];
  for (let i = 1; i < series.length; i++) {
    const prev = Number(series[i-1].yhat)||0, cur = Number(series[i].yhat)||0;
    const pct = prev>0 ? ((cur-prev)/prev)*100 : (cur>0?100:0);
    deltasDay.push({ date: series[i].date, delta_pct: pct, yhat: cur });
  }
  deltasDay.sort((a,b)=>a.delta_pct-b.delta_pct);
  const minDrop = deltasDay.length ? deltasDay[0] : null;

  // CTA suggestion: use stock suggestion if available, fallback to generic
  const ctaText = stock && stock.suggested_reorder_qty != null
    ? `Commander ${stock.suggested_reorder_qty} unités d'ici ${new Date(Date.now()+7*86400000).toLocaleDateString('fr-FR')}`
    : 'Planifier un réassort sur 7 jours';
  const reasons: string[] = [];
  if (maxSurge) reasons.push(`Surge max ${maxSurge.delta_pct.toFixed(1)}% le ${maxSurge.date}`);
  if (d7!=null) reasons.push(`Δ 7j ${d7.toFixed(1)}%`);
  if (stock && stock.days_until_oos!=null) reasons.push(`Rupture estimée dans ${Math.round(stock.days_until_oos)} jours`);

  // Confidence score from uncertainty band width
  const confidence01 = (() => {
    const valid = series.filter(r => typeof r.p10 === 'number' && typeof r.p90 === 'number' && typeof r.yhat === 'number');
    if (!valid.length) return 0.6;
    const avgRatio = valid.reduce((s, r) => {
      const denom = Math.max(1e-6, Number(r.yhat));
      return s + Math.max(0, Math.min(1, (Number(r.p90) - Number(r.p10)) / (2 * denom)));
    }, 0) / valid.length;
    return Math.max(0.2, Math.min(0.95, 1 - avgRatio));
  })();

  return (
    <div className="space-y-6">
      {/* Forecast Overview Panel */}
      <DemandForecastPanel
        title="Demand Forecast"
        daysAhead={horizon}
        countryChips={countriesList}
        categoryChips={categoryChips}
        avoidedStockouts7d={0}
        series={series}
        showBand={showBand}
        productName={productId==='csv' ? 'Produit démo' : productId}
        productId={productId}
        countryCode={country}
        channelCode={channel}
        growthDeltaPct={Math.round(growthCurrent)}
        confidence01={confidence01}
        stockDays={stock?.days_until_oos ?? null}
        leadDays={stock?.lead_days ?? null}
        reasons={reasons}
        poQty={stock?.suggested_reorder_qty ?? null}
        detailsHref={`/products/${encodeURIComponent(productId)}`}
        decliningName={minDrop ? 'Produit en baisse' : undefined}
        decliningDeltaPct={minDrop ? Math.round(minDrop.delta_pct) : undefined}
        decliningNote={minDrop ? 'Discount ou bundle pour écouler' : undefined}
      />
      <form className="flex flex-wrap items-end gap-3" method="get">
        <div>
          <label className="block text-sm text-neutral-400">Produit</label>
          <input name="productId" defaultValue={sp.productId || 'csv'} className="bg-neutral-900 border border-white/10 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-neutral-400">Pays</label>
          <input name="country" defaultValue={sp.country || 'FR'} className="bg-neutral-900 border border-white/10 rounded px-3 py-2 w-24" />
        </div>
        <div>
          <label className="block text-sm text-neutral-400">Canal</label>
          <input name="channel" defaultValue={sp.channel || 'AMAZON'} className="bg-neutral-900 border border-white/10 rounded px-3 py-2 w-32" />
        </div>
        <div>
          <label className="block text-sm text-neutral-400">Horizon (jours)</label>
          <input name="h" defaultValue={sp.h || '30'} className="bg-neutral-900 border border-white/10 rounded px-3 py-2 w-24" />
        </div>
        <div>
          <label className="block text-sm text-neutral-400">Fenêtre surges (jours)</label>
          <input name="win" defaultValue={sp.win || sp.window || '14'} className="bg-neutral-900 border border-white/10 rounded px-3 py-2 w-24" />
        </div>
        <div>
          <label className="block text-sm text-neutral-400">Top N surges</label>
          <input name="top" defaultValue={sp.top || '5'} className="bg-neutral-900 border border-white/10 rounded px-3 py-2 w-24" />
        </div>
        <div className="flex items-center gap-2 pb-2">
          <input id="band" type="checkbox" name="band" value="1" defaultChecked={showBand} className="rounded border-white/10 bg-neutral-900" />
          <label htmlFor="band" className="text-sm text-neutral-300">Afficher l'intervalle p10–p90</label>
        </div>
        <button type="submit" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Mettre à jour</button>
        <a href="/forecast?productId=csv&country=FR&channel=AMAZON&h=30" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">Remplir avec exemple</a>
        <a href="/forecast" className="rounded-lg border border-white/10 bg-white/0 px-3 py-2 text-sm">Réinitialiser</a>
      </form>

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-neutral-500">{country} · {channel} · H{horizon} · {productId} — Source: {data.source || '—'}</div>
        <div className="flex items-center gap-2">
          <CopyLinkButton />
          {Array.isArray((data as any).series) && (data as any).series.length > 0 && (
            <ExportCsv rows={(data as any).series} />
          )}
          {/* Server CSV export for demand */}
          <a
            className="rounded-lg border border-white/10 bg-white/0 px-3 py-2 text-xs hover:bg-white/5"
            href={`${base}/bff/export/csv?resource=forecast_demand&productId=${encodeURIComponent(productId)}&country=${encodeURIComponent(country)}&channel=${encodeURIComponent(channel)}&horizon=${encodeURIComponent(String(horizon))}`}
          >CSV serveur (prévision)</a>
        </div>
      </div>

      {series.length > 0 && (
        <div className="rounded-xl border border-white/10 p-4 bg-white/5">
          <div className="mb-2 text-sm text-neutral-300">Tendance (p50)</div>
          {/* Client-side chart to avoid SSR issues */}
          <Sparkline rows={series} showBand={showBand} />
        </div>
      )}

      {/* Summary cards */}
      {series.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="rounded-xl border border-white/10 p-4 bg-white/5"><div className="text-xs text-neutral-400">p50 min</div><div className="text-lg font-semibold">{p50Min != null ? Math.round(p50Min) : '—'}</div></div>
          <div className="rounded-xl border border-white/10 p-4 bg-white/5"><div className="text-xs text-neutral-400">p50 médiane</div><div className="text-lg font-semibold">{p50Median != null ? Math.round(p50Median) : '—'}</div></div>
          <div className="rounded-xl border border-white/10 p-4 bg-white/5"><div className="text-xs text-neutral-400">p50 max</div><div className="text-lg font-semibold">{p50Max != null ? Math.round(p50Max) : '—'}</div></div>
          <div className="rounded-xl border border-white/10 p-4 bg-white/5"><div className="text-xs text-neutral-400">Δ 7j</div><div className={`text-lg font-semibold ${d7!=null && d7>=0 ? 'text-emerald-400' : d7!=null ? 'text-rose-400' : ''}`}>{d7!=null ? `${(d7).toFixed(1)}%` : '—'}</div></div>
          <div className="rounded-xl border border-white/10 p-4 bg-white/5"><div className="text-xs text-neutral-400">Δ 14j</div><div className={`text-lg font-semibold ${d14!=null && d14>=0 ? 'text-emerald-400' : d14!=null ? 'text-rose-400' : ''}`}>{d14!=null ? `${(d14).toFixed(1)}%` : '—'}</div></div>
        </div>
      )}

      {stock && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/10 p-4 bg-white/5">
            <div className="text-xs text-neutral-400">Conso moyenne</div>
            <div className="text-lg font-semibold">{Math.round(stock.avg_daily_sales || 0)} /j</div>
          </div>
          <div className="rounded-xl border border-white/10 p-4 bg-white/5">
            <div className="text-xs text-neutral-400">Jours avant rupture (est.)</div>
            <div className="text-lg font-semibold">{stock.days_until_oos != null ? Math.round(stock.days_until_oos) : '—'}</div>
          </div>
          <div className="rounded-xl border border-white/10 p-4 bg-white/5">
            <div className="text-xs text-neutral-400">Réassort suggéré ({horizon}j)</div>
            <div className="text-lg font-semibold">{stock.suggested_reorder_qty != null ? stock.suggested_reorder_qty : '—'}</div>
          </div>
        </div>
      )}

      {/* Top surges */}
      {Array.isArray((surge as any).points) && (surge as any).points.length > 0 && (
        <div className="rounded-xl border border-white/10 p-4 bg-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-300">Top surges (fenêtre {surge.window}j)</div>
            <div className="flex items-center gap-2">
              <ExportCsv rows={(surge as any).points.map((p: any) => ({ date: p.date, yhat: p.yhat, delta_pct: p.delta_pct }))} />
              <a
                className="rounded-lg border border-white/10 bg-white/0 px-3 py-1.5 text-xs hover:bg-white/5"
                href={`${base}/bff/export/csv?resource=forecast_surge&productId=${encodeURIComponent(productId)}&country=${encodeURIComponent(country)}&channel=${encodeURIComponent(channel)}&window=${encodeURIComponent(String((surge as any).window || 14))}&top=${encodeURIComponent(String(sp.top || '5'))}`}
              >CSV serveur (surges)</a>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-900/60">
                <tr>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-right px-3 py-2">p50 (yhat)</th>
                  <th className="text-right px-3 py-2">Δ% vs jour-1</th>
                </tr>
              </thead>
              <tbody>
                {(surge as any).points.map((p: any) => (
                  <tr key={p.date} className="odd:bg-neutral-950/40">
                    <td className="px-3 py-2">{p.date}</td>
                    <td className="px-3 py-2 text-right">{Math.round(p.yhat)}</td>
                    <td className={`px-3 py-2 text-right ${p.delta_pct>=0 ? 'text-emerald-400' : 'text-rose-400'}`}>{p.delta_pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900/60">
            <tr>
              <th className="text-left px-3 py-2">Date</th>
              <th className="text-right px-3 py-2">p10</th>
              <th className="text-right px-3 py-2">p50</th>
              <th className="text-right px-3 py-2">p90</th>
            </tr>
          </thead>
          <tbody>
            {series.map((r: any) => (
              <tr key={r.date} className="odd:bg-neutral-950/40">
                <td className="px-3 py-2">{r.date}</td>
                <td className="px-3 py-2 text-right text-neutral-400">{r.p10?.toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-medium">{r.yhat?.toFixed(2)}</td>
                <td className="px-3 py-2 text-right text-neutral-400">{r.p90?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.source?.startsWith('error:') && (
        <div className="text-sm text-red-400">
          {data.source === 'error:401' ? (
            <span>Veuillez vous <a className="underline" href="/login">connecter</a> pour voir les prévisions.</span>
          ) : (
            <span>Erreur de récupération ({data.source}).</span>
          )}
        </div>
      )}
    </div>
  );
}
