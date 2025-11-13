import { BffRepo, KpiOverview, TimeseriesPoint, CompetitorDiff, MarketHeatmapRow, AlertMovement, PricingBaseline, StockPredict, RadarTrendRow, GainerRow } from './repo.js';
import fs from 'fs';
import path from 'path';
import { getPrisma } from '../db.js';
import { Prisma } from '@prisma/client';

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

  async competitorsDiff(period: 'last_7d'|'last_30d'|'last_90d', country: string|undefined, accountId: string, category?: string): Promise<CompetitorDiff[]> {
    return this.repo.getCompetitorsDiff(period, country, accountId, category);
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

  async opportunitiesGainers(period: 'last_7d'|'last_30d', country: string|undefined, accountId: string, limit = 50, sort: 'growth'|'revenue' = 'growth'): Promise<GainerRow[]> {
    return this.repo.getOpportunitiesGainers(period, country, accountId, limit, sort);
  }

  async createPoAction(params: { userId: string; productId: string; qty: number; country?: string; channel?: string; note?: string }): Promise<{ id: string; status: string }>{
    const prisma = getPrisma();
    const payload = {
      qty: params.qty,
      country: params.country || null,
      channel: params.channel || null,
    };
    const rec = await (prisma as any).actionRecommendation.create({ data: {
      userId: params.userId,
      productId: params.productId,
      type: 'po',
      status: 'draft',
      note: params.note || null,
      payload: payload as Prisma.JsonObject,
    }});
    return { id: rec.id, status: rec.status };
  }

  async createPriceAction(params: { userId: string; productId: string; newPrice: number; note?: string }): Promise<{ id: string; status: string }>{
    const prisma = getPrisma();
    const payload = { new_price: params.newPrice };
    const rec = await (prisma as any).actionRecommendation.create({ data: {
      userId: params.userId,
      productId: params.productId,
      type: 'price',
      status: 'draft',
      note: params.note || null,
      payload: payload as Prisma.JsonObject,
    }});
    return { id: rec.id, status: rec.status };
  }

  /**
   * Forecast demand by reading latest training artifacts on disk (MVP).
   * Later we will switch to DB tables forecast_result for persistence.
   */
  async forecastDemand(productId: string, country: string|undefined, channel: string|undefined, horizon: number): Promise<{ series: { date: string; yhat: number; p10: number; p90: number }[]; source: string }>{
    // Try DB first (if Prisma models are available and data exists)
    try {
      if (productId && productId !== 'csv') {
        const prisma = getPrisma();
  const run = await (prisma as any).forecastRun.findFirst({
          where: {
            productId,
            ...(country ? { country } : {}),
            ...(channel ? { channel } : {}),
          },
          orderBy: { createdAt: 'desc' },
          include: { results: { orderBy: { date: 'asc' }, take: horizon } },
        });
        if (run && run.results && run.results.length > 0) {
          const series = (run.results as any[]).map((r: any) => ({ date: new Date(r.date).toISOString().slice(0,10), yhat: Number(r.yhat), p10: Number(r.p10 ?? r.yhat), p90: Number(r.p90 ?? r.yhat) }));
          return { series, source: `db:run:${run.id}` };
        }
      }
    } catch { /* ignore and fallback to artifacts */ }

  const base = path.resolve(process.cwd(), '..', 'forecasting', 'artifacts');
    const key = `p${productId}_${country || 'FR'}_${channel || 'GLOBAL'}`;
    // For CSV sample runs, key starts with pcsv_
    const candidates = [key, `pcsv_${country || 'FR'}_${channel || 'GLOBAL'}`];
    let dir: string | null = null;
    for (const k of candidates) {
      const kpath = path.join(base, k);
      if (fs.existsSync(kpath) && fs.statSync(kpath).isDirectory()) {
        // pick most recent subdir by timestamp name
        const subs = fs.readdirSync(kpath).filter((d) => fs.statSync(path.join(kpath, d)).isDirectory());
        subs.sort((a,b) => b.localeCompare(a));
        if (subs.length > 0) { dir = path.join(kpath, subs[0]); break; }
      }
    }
    if (!dir) {
      return { series: [], source: 'none' };
    }
    const csvPath = path.join(dir, 'forecast.csv');
    if (!fs.existsSync(csvPath)) {
      return { series: [], source: dir };
    }
    const raw = fs.readFileSync(csvPath, 'utf-8');
    const lines = raw.trim().split(/\r?\n/);
    const header = lines.shift() || '';
    const cols = header.split(',').map((s) => s.trim());
    const iDate = cols.indexOf('date');
    const iY = cols.indexOf('yhat');
    const iP10 = cols.indexOf('p10');
    const iP90 = cols.indexOf('p90');
    const series = lines.slice(0, Math.max(0, horizon)).map((line) => {
      const parts = line.split(',');
      return {
        date: parts[iDate],
        yhat: Number(parts[iY]),
        p10: Number(parts[iP10]),
        p90: Number(parts[iP90]),
      };
    });
    return { series, source: dir };
  }

  /**
   * Import latest artifacts for a given key into DB tables (ForecastRun/ForecastResult).
   * Returns created run id and number of inserted rows.
   */
  async importForecastFromArtifacts(productId: string, country?: string, channel?: string, horizon?: number): Promise<{ runId: string; inserted: number; source: string }>{
  const base = path.resolve(process.cwd(), '..', 'forecasting', 'artifacts');
    const key = `p${productId}_${country || 'FR'}_${channel || 'GLOBAL'}`;
    const candidates = [key, `pcsv_${country || 'FR'}_${channel || 'GLOBAL'}`];
    let dir: string | null = null;
    for (const k of candidates) {
      const kpath = path.join(base, k);
      if (fs.existsSync(kpath) && fs.statSync(kpath).isDirectory()) {
        const subs = fs.readdirSync(kpath).filter((d) => fs.statSync(path.join(kpath, d)).isDirectory());
        subs.sort((a,b) => b.localeCompare(a));
        if (subs.length > 0) { dir = path.join(kpath, subs[0]); break; }
      }
    }
    if (!dir) throw new Error('artifacts_not_found');
    const csvPath = path.join(dir, 'forecast.csv');
    if (!fs.existsSync(csvPath)) throw new Error('forecast_csv_not_found');
    const raw = fs.readFileSync(csvPath, 'utf-8');
    const lines = raw.trim().split(/\r?\n/);
    const header = lines.shift() || '';
    const cols = header.split(',').map((s) => s.trim());
    const iDate = cols.indexOf('date');
    const iY = cols.indexOf('yhat');
    const iP10 = cols.indexOf('p10');
    const iP90 = cols.indexOf('p90');
    const seriesAll = lines.map((line) => {
      const parts = line.split(',');
      return {
        date: new Date(parts[iDate]),
        yhat: Number(parts[iY]),
        p10: parts[iP10] != null && parts[iP10] !== '' ? Number(parts[iP10]) : null,
        p90: parts[iP90] != null && parts[iP90] !== '' ? Number(parts[iP90]) : null,
      };
    });
    const series = typeof horizon === 'number' ? seriesAll.slice(0, Math.max(0, horizon)) : seriesAll;
    const prisma = getPrisma();
    // Create run
    const run = await (prisma as any).forecastRun.create({ data: {
      productId: undefined, // optional product relation left null unless you want to link by SKU mapping
      country: country || null,
      channel: channel || null,
      horizon: horizon || series.length,
      model: 'artifacts-import',
      status: 'completed',
      metricsJson: null,
    }});
    // Insert results
    const createManyData = series.map((r) => ({ runId: run.id, date: r.date, yhat: r.yhat, p10: r.p10 as number | null, p90: r.p90 as number | null }));
    await (prisma as any).forecastResult.createMany({ data: createManyData as any });
    return { runId: run.id, inserted: series.length, source: dir };
  }

  /**
   * Compute surge metrics from forecast results (max day-over-day growth over a window).
   */
  async forecastSurge(opts: { productId?: string; country?: string; channel?: string; window?: number; top?: number }): Promise<{ window: number; runId: string|null; points: Array<{ date: string; yhat: number; delta_pct: number }>; summary: { max_delta_pct: number; max_date: string|null } }>{
    const prisma = getPrisma();
    // Find latest run matching filters (product optional because artifacts import may not set it)
    const run = await (prisma as any).forecastRun.findFirst({
      where: {
        ...(opts.productId ? { productId: opts.productId } : {}),
        ...(opts.country ? { country: opts.country } : {}),
        ...(opts.channel ? { channel: opts.channel } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { results: { orderBy: { date: 'asc' } } },
    });
    if (!run || !run.results || run.results.length < 2) {
      return { window: opts.window || 14, runId: run?.id ?? null, points: [], summary: { max_delta_pct: 0, max_date: null } };
    }
    const w = Math.max(2, opts.window || 14);
    const series = (run.results as any[]).slice(0, w);
    const points = [] as Array<{ date: string; yhat: number; delta_pct: number }>;
    for (let i = 1; i < series.length; i++) {
      const prev = Number(series[i-1].yhat);
      const cur = Number(series[i].yhat);
      const delta_pct = prev > 0 ? ((cur - prev) / prev) * 100 : (cur > 0 ? 100 : 0);
      points.push({ date: new Date(series[i].date).toISOString().slice(0,10), yhat: cur, delta_pct });
    }
    // Sort by highest surge and take top N if requested (though for single series this is the same set)
    points.sort((a,b) => b.delta_pct - a.delta_pct);
    const top = typeof opts.top === 'number' ? Math.max(1, opts.top) : points.length;
    const trimmed = points.slice(0, top);
    const max = points.length ? points[0] : { delta_pct: 0, date: null } as any;
    return { window: w, runId: run.id, points: trimmed, summary: { max_delta_pct: max.delta_pct, max_date: (max as any).date } };
  }
}
