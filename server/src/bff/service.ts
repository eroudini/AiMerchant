import { BffRepo, KpiOverview, TimeseriesPoint, CompetitorDiff, MarketHeatmapRow, AlertMovement, PricingBaseline, StockPredict, RadarTrendRow } from './repo.js';

export class BffService {
  constructor(private repo: BffRepo) {}

  async overview(period: 'last_7d'|'last_30d'|'last_90d', country: string|undefined, accountId: string): Promise<KpiOverview> {
    const data = await this.repo.getOverview(period, country, accountId);
    // Ensure AOV computed
    const aov = data.units > 0 ? data.gmv / data.units : 0;
    return { ...data, aov };
  }

  async productTimeseries(productCode: string, metrics: string[], from: string, to: string, granularity: 'day'|'hour', order: 'asc'|'desc', limit: number|undefined, accountId: string, country?: string): Promise<TimeseriesPoint[]> {
    return this.repo.getProductTimeseries(productCode, metrics, from, to, granularity, order, limit, accountId, country);
  }

  async competitorsDiff(period: 'last_7d'|'last_30d'|'last_90d', country: string|undefined, accountId: string): Promise<CompetitorDiff[]> {
    return this.repo.getCompetitorsDiff(period, country, accountId);
  }

  async marketHeatmap(period: 'last_7d', country: string|undefined, accountId: string): Promise<MarketHeatmapRow[]> {
    return this.repo.getMarketHeatmap(period, country, accountId);
  }

  async alertsMovements(period: 'last_7d', country: string|undefined, accountId: string, types: ('price'|'stock')[] = ['price','stock'], thresholdPct = 10, limit = 20): Promise<AlertMovement[]> {
    return this.repo.getAlertsMovements(period, country, accountId, types, thresholdPct, limit);
  }

  async pricingSimulate(sku: string, deltaPct: number, country: string|undefined, accountId: string): Promise<any> {
    const baseline: PricingBaseline|null = await this.repo.getPricingBaseline(sku, country, accountId);
    if (!baseline) return { sku, error: 'no_baseline' };
    const baseUnits = baseline.units_7d || 0;
    const baseRevenue = baseline.revenue_7d || 0;
    const basePrice = baseline.avg_price && baseline.avg_price > 0 ? baseline.avg_price : (baseUnits > 0 ? baseRevenue / baseUnits : 0);
    const elasticity = -1.2; // simple assumption
    const priceFactor = 1 + (deltaPct/100);
    const newPrice = basePrice * priceFactor;
    const unitsFactor = 1 + elasticity * (deltaPct/100);
    const newUnits = Math.max(0, Math.round(baseUnits * unitsFactor));
    const newRevenue = newPrice * newUnits;
    const upliftRevenuePct = baseRevenue > 0 ? ((newRevenue - baseRevenue)/baseRevenue)*100 : 0;
    return {
      sku,
      product_name: baseline.product_name ?? null,
      category: baseline.category ?? null,
      base_price: basePrice,
      new_price: newPrice,
      base_units_7d: baseUnits,
      new_units_7d: newUnits,
      base_revenue_7d: baseRevenue,
      new_revenue_7d: newRevenue,
      uplift_revenue_pct: upliftRevenuePct,
      elasticity_used: elasticity,
      delta_pct: deltaPct,
    };
  }

  async pricingSuggest(sku: string, target: number, clamp: number|undefined, buy: number, fees: number, country: string|undefined, accountId: string): Promise<{ sku: string; competitor_price?: number|null; candidate: number; suggested: number }>{
    const competitor = await this.repo.getCompetitorPriceAvg(sku, country, accountId);
    const candidate = (buy + fees) / (1 - target);
    let suggested = candidate;
    if (competitor != null && clamp != null && clamp > 0) {
      const low = competitor * (1 - clamp);
      const high = competitor * (1 + clamp);
      suggested = Math.max(Math.min(candidate, high), low);
    }
    suggested = Math.round(suggested * 100) / 100;
    return { sku, competitor_price: competitor, candidate: Math.round(candidate*100)/100, suggested };
  }

  async stockPredict(product: string, country: string|undefined, accountId: string, leadDays = 7): Promise<StockPredict & { suggested_reorder_qty: number|null; lead_days: number }>{
    const res = await this.repo.getStockPredict(product, country, accountId, leadDays);
    const avg = res.avg_daily_sales ?? 0;
    const suggested = avg > 0 ? Math.ceil(avg * leadDays * 1.2) : null; // 20% safety factor
    return { ...res, suggested_reorder_qty: suggested, lead_days: leadDays };
  }

  async radarTrends(period: 'last_30d'|'last_90d', type: 'category'|'product', country: string|undefined, accountId: string, limit = 20): Promise<RadarTrendRow[]> {
    return this.repo.getRadarTrends(period, type, country, accountId, limit);
  }
}
