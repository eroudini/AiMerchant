import { cookies } from 'next/headers';
import { getOverview, getCompetitorsDiff, getMarketHeatmap, getAlertsMovements, getRadarTrends } from '../../../../client/lib/bff';
import KpiCards from '../../../../client/components/dashboard/KpiCards';
import CompetitorsTable from '../../../../client/components/dashboard/CompetitorsTable';
import MarketHeatmap from '../../../../client/components/dashboard/MarketHeatmap';
import AlertsList from '../../../../client/components/dashboard/AlertsList';
import SmartMarginCard from '../../../../client/components/dashboard/SmartMargin';
import StockPredictorCard from '../../../../client/components/dashboard/StockPredictor';
import ProductRadar from '../../../../client/components/dashboard/ProductRadar';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const all = (cookieStore as any).getAll ? (cookieStore as any).getAll() : [];
  const cookieHeader = all.map((c: any) => `${c.name}=${c.value}`).join('; ');
  const period = 'last_7d';
  const country = 'FR';
  let overview: any = { gmv: 0, net_margin: 0, units: 0, aov: 0 };
  let competitors: any[] = [];
  let heatmap: any[] = [];
  let alerts: any[] = [];
  let radarProduct: any[] = [];
  let radarCategory: any[] = [];
  try { overview = await getOverview({ period, country, cookie: cookieHeader }); } catch {}
  try { competitors = await getCompetitorsDiff({ period, country, cookie: cookieHeader }); } catch {}
  try { heatmap = await getMarketHeatmap({ period: 'last_7d', country, cookie: cookieHeader }); } catch {}
  try { alerts = await getAlertsMovements({ period: 'last_7d', country, threshold: 10, limit: 12, cookie: cookieHeader }); } catch {}
  try { radarProduct = await getRadarTrends({ period: 'last_30d', type: 'product', country, limit: 100, cookie: cookieHeader }); } catch {}
  try { radarCategory = await getRadarTrends({ period: 'last_30d', type: 'category', country, limit: 100, cookie: cookieHeader }); } catch {}

  return (
    <div className="p-6">
      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-amber-900/20 via-neutral-900/20 to-black/30 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.03)]">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">IA Retail</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Tableau de bord</h1>
          <p className="mt-1 text-sm text-neutral-400">Vue synthétique: performance, alertes, prévisions et recommandations IA. Agissez rapidement sur le pricing, le réassort et la marge.</p>
        </div>
        <div className="space-y-6">
          <KpiCards data={overview} />
          <div className="grid grid-cols-1 gap-6">
            <AlertsList rows={alerts} />
            <SmartMarginCard country={country} />
            <ProductRadar rowsProduct={radarProduct} rowsCategory={radarCategory} period="last_30d" />
            <StockPredictorCard country={country} />
            <MarketHeatmap rows={heatmap} />
            <CompetitorsTable rows={competitors} />
          </div>
        </div>
      </div>
    </div>
  );
}
