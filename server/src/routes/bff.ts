import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateQuery, validateParams, validateBody } from '../middleware/validateClass.js';
import { OverviewQueryDto, ProductTimeseriesParamsDto, ProductTimeseriesQueryDto, CompetitorsDiffQueryDto, MarketHeatmapQueryDto, AlertsMovementsQueryDto, PricingSimulateQueryDto, StockPredictQueryDto, ProductRadarTrendsQueryDto, ExportCsvQueryDto, PricingSuggestQueryDto, PricingApplyBodyDto } from '../bff/dto.js';
import { getPrisma } from '../db.js';
import { BffService } from '../bff/service.js';
import { PgBffRepo } from '../bff/repo.js';

const router = Router();
router.use(requireAuth, requireRole('viewer'));

function getAccountId(req: any): string {
  // Prefer explicit account_id claim if present; fallback to sub for dev
  return req.user?.account_id || req.user?.sub;
}

function getService(app: any): BffService {
  const repo = app.locals.bffRepo || new PgBffRepo();
  return new BffService(repo);
}

router.get('/kpi/overview', validateQuery(OverviewQueryDto), async (req: any, res) => {
  const { period, country } = req.validated.query as OverviewQueryDto;
  const accountId = getAccountId(req);
  const svc = getService(req.app);
  const data = await svc.overview(period, country, accountId);
  res.json(data);
});

router.get('/products/:id/timeseries', validateParams(ProductTimeseriesParamsDto), validateQuery(ProductTimeseriesQueryDto), async (req: any, res) => {
  const { id } = req.validated.params as ProductTimeseriesParamsDto;
  const { metrics, from, to, granularity = 'day', order = 'asc', limit } = req.validated.query as ProductTimeseriesQueryDto;
  const accountId = getAccountId(req);
  const svc = getService(req.app);
  const series = await svc.productTimeseries(id, metrics.split(','), from, to, granularity || 'day', order || 'asc', limit ? Number(limit) : undefined, accountId);
  res.json({ id, series });
});

router.get('/competitors/diff', validateQuery(CompetitorsDiffQueryDto), async (req: any, res) => {
  const { period, country } = req.validated.query as CompetitorsDiffQueryDto;
  const accountId = getAccountId(req);
  const svc = getService(req.app);
  const rows = await svc.competitorsDiff(period, country, accountId);
  res.json(rows);
});

router.get('/market/heatmap', validateQuery(MarketHeatmapQueryDto), async (req: any, res) => {
  const { period, country } = req.validated.query as MarketHeatmapQueryDto;
  const accountId = getAccountId(req);
  const svc = getService(req.app);
  const rows = await svc.marketHeatmap(period, country, accountId);
  res.json(rows);
});

router.get('/alerts/movements', validateQuery(AlertsMovementsQueryDto), async (req: any, res) => {
  const { period, country, types, threshold, limit } = req.validated.query as AlertsMovementsQueryDto;
  const accountId = getAccountId(req);
  const svc = getService(req.app);
  const typeArr = (types ? types.split(',') : ['price','stock']) as ('price'|'stock')[];
  const th = threshold ? Number(threshold) : 10;
  const lim = limit ? Number(limit) : 20;
  const rows = await svc.alertsMovements(period, country, accountId, typeArr, th, lim);
  res.json(rows);
});

router.get('/pricing/simulate', validateQuery(PricingSimulateQueryDto), async (req: any, res) => {
  const { sku, delta, country } = req.validated.query as PricingSimulateQueryDto;
  const accountId = getAccountId(req);
  const svc = getService(req.app);
  const result = await svc.pricingSimulate(sku, Number(delta), country, accountId);
  res.json(result);
});

router.get('/pricing/suggest', validateQuery(PricingSuggestQueryDto), async (req: any, res) => {
  const { sku, target, clamp, buy, fees, country } = req.validated.query as any as { sku: string; target: string; clamp?: string; buy: string; fees: string; country?: string };
  const accountId = getAccountId(req);
  const svc = getService(req.app);
  const result = await svc.pricingSuggest(sku, Number(target), clamp? Number(clamp): undefined, Number(buy), Number(fees), country, accountId);
  res.json(result);
});

router.post('/pricing/apply', validateBody(PricingApplyBodyDto), async (req: any, res) => {
  const { sku, new_price, note } = req.validated.body as any as { sku: string; new_price: string; note?: string };
  const prisma = getPrisma();
  // Find product by SKU
  const product = await prisma.product.findFirst({ where: { sku } });
  if (!product) return res.status(404).json({ error: 'product_not_found' });
  // Record suggestion (as change log)
  const rec = await prisma.priceSuggestion.create({ data: {
    userId: product.userId,
    productId: product.id,
    suggestedPrice: Number(new_price),
    inputsJson: { source: 'smartmargin', note: note||null, at: new Date().toISOString() }
  }});
  // TODO: push to marketplaces when credentials configured
  res.json({ status: 'queued', id: rec.id });
});

router.get('/stock/predict', validateQuery(StockPredictQueryDto), async (req: any, res) => {
  const { product, country, lead_days } = req.validated.query as StockPredictQueryDto;
  const accountId = getAccountId(req);
  const svc = getService(req.app);
  const result = await svc.stockPredict(product, country, accountId, lead_days ? Number(lead_days) : 7);
  res.json(result);
});

router.get('/radar/trends', validateQuery(ProductRadarTrendsQueryDto), async (req: any, res) => {
  const { period, type = 'category', country, limit } = req.validated.query as ProductRadarTrendsQueryDto;
  const accountId = getAccountId(req);
  const svc = getService(req.app);
  const rows = await svc.radarTrends(period, (type || 'category'), country, accountId, limit ? Number(limit) : 20);
  res.json(rows);
});

router.get('/export/csv', validateQuery(ExportCsvQueryDto), async (req: any, res) => {
  const q = req.validated.query as ExportCsvQueryDto;
  const accountId = getAccountId(req);
  const svc = getService(req.app);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  const filename = `${q.resource}-${Date.now()}.csv`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  if (q.resource === 'radar_trends') {
    const period = (q.period === 'last_90d' ? 'last_90d' : 'last_30d') as 'last_30d'|'last_90d';
    const type = (q.type === 'product' ? 'product' : 'category') as 'product'|'category';
    const rows = await svc.radarTrends(period, type, q.country, accountId, q.limit ? Number(q.limit) : 100);
    const header = type === 'product' ? 'id,name,category,revenue_cur,revenue_prev,growth_pct,units_cur' : 'id,revenue_cur,revenue_prev,growth_pct,units_cur';
      const csv = [header].concat(rows.map(r => type==='product'
        ? [r.id, (r.name||''), (r.category||''), r.revenue_cur, r.revenue_prev, r.growth_pct, r.units_cur].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')
        : [r.id, r.revenue_cur, r.revenue_prev, r.growth_pct, r.units_cur].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')
    )).join('\n');
    return res.send(csv);
  }

  if (q.resource === 'market_heatmap') {
    const period = 'last_7d' as const;
    const rows = await svc.marketHeatmap(period, q.country, accountId);
    const header = 'category,avg_price,delta_pct,revenue,units';
    const csv = [header].concat(rows.map(r => [r.category, r.avg_price, r.delta_pct, r.revenue, r.units].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))).join('\n');
    return res.send(csv);
  }

  if (q.resource === 'competitors_diff') {
    const period = (q.period === 'last_30d' ? 'last_30d' : q.period === 'last_90d' ? 'last_90d' : 'last_7d') as 'last_7d'|'last_30d'|'last_90d';
    const rows = await svc.competitorsDiff(period, q.country, accountId);
    const header = 'competitor_id,avg_diff,observations';
    const csv = [header].concat(rows.map(r => [r.competitor_id, r.avg_diff, r.observations].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))).join('\n');
    return res.send(csv);
  }

  if (q.resource === 'alerts_movements') {
    const rows = await svc.alertsMovements('last_7d', q.country, accountId, (q.types? q.types.split(',') as any : ['price','stock']), q.threshold? Number(q.threshold): 10, q.limit? Number(q.limit): 100);
    const header = 'type,product_code,product_name,category,delta_pct,current,previous';
    const csv = [header].concat(rows.map(r => [r.type, r.product_code, (r.product_name||''), (r.category||''), r.delta_pct, r.current, r.previous].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))).join('\n');
    return res.send(csv);
  }

  return res.send('');
});

export default router;
