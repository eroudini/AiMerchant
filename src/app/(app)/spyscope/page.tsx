import { cookies } from 'next/headers';
import CompetitorsTable from '../../../../client/components/dashboard/CompetitorsTable';
import MarketHeatmap from '../../../../client/components/dashboard/MarketHeatmap';
import AlertsList from '../../../../client/components/dashboard/AlertsList';
import { getCompetitorsDiff, getMarketHeatmap, getAlertsMovements } from '../../../../client/lib/bff';
import FilterBar from '../../../../client/components/spyscope/FilterBar';
import QuickExports from '../../../../client/components/spyscope/QuickExports';

export default async function SpyScopePage({ searchParams }: { searchParams?: Promise<Record<string, string | string[]>> }) {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  const cookieHeader = all.map((c: any) => `${c.name}=${c.value}`).join('; ');
  const sp = searchParams ? await searchParams : ({} as Record<string, string | string[]>);
  const periodParam = typeof sp.period === 'string' ? sp.period : Array.isArray(sp.period) ? sp.period[0] : undefined;
  const countryParam = typeof sp.country === 'string' ? sp.country : Array.isArray(sp.country) ? sp.country[0] : undefined;
  const categoryParam = typeof sp.category === 'string' ? sp.category : Array.isArray(sp.category) ? sp.category[0] : undefined;
  const period = (periodParam === 'last_7d' || periodParam === 'last_30d' || periodParam === 'last_90d') ? periodParam : 'last_7d';
  const country = (countryParam && countryParam.length === 2) ? countryParam.toUpperCase() : 'FR';
  const category = (categoryParam && categoryParam.trim().length > 0) ? categoryParam.trim() : undefined;
  let competitors: any[] = [];
  let heatmap: any[] = [];
  let alerts: any[] = [];
  try { competitors = await getCompetitorsDiff({ period, country, category, cookie: cookieHeader }); } catch {}
  try { heatmap = await getMarketHeatmap({ period: 'last_7d', country, cookie: cookieHeader }); } catch {}
  try { alerts = await getAlertsMovements({ period: 'last_7d', country, threshold: 10, limit: 20, cookie: cookieHeader }); } catch {}

  return (
    <div className="p-6">
      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-amber-900/20 via-neutral-900/20 to-black/30 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.03)] text-white">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">SpyScope</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Intelligence concurrentielle</h1>
          <p className="mt-1 text-sm text-neutral-300">Suivez les mouvements de prix des concurrents, les zones chaudes du marché, et les alertes significatives.</p>
          <div className="mt-4 flex flex-col gap-3">
            <FilterBar />
            <QuickExports period={period} country={country} category={category} />
          </div>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-medium">Mouvements concurrents</h2>
            <CompetitorsTable rows={competitors} period={period} country={country} category={category}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Heatmap marché</h2>
            <MarketHeatmap rows={heatmap} />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Alertes</h2>
            <AlertsList rows={alerts} />
          </section>
        </div>
      </div>
    </div>
  );
}
