import request from 'supertest';
import { createApp } from '../src/app';
import jwt from 'jsonwebtoken';
import { BffRepo, KpiOverview, TimeseriesPoint, CompetitorDiff, MarketHeatmapRow, AlertMovement, PricingBaseline, StockPredict, RadarTrendRow, GainerRow } from '../src/bff/repo';

class FakeRepo implements BffRepo {
  async getOverview(): Promise<KpiOverview> { return { gmv: 1000, net_margin: 300, units: 50, aov: 20 }; }
  async getProductTimeseries(): Promise<TimeseriesPoint[]> { return [{ ts: new Date().toISOString(), value: 100, metric: 'sales' }]; }
  async getCompetitorsDiff(): Promise<CompetitorDiff[]> { return [{ competitor_id: 'c1', avg_diff: -2.5, observations: 10 }]; }
  async getMarketHeatmap(): Promise<MarketHeatmapRow[]> { return [{ category: 'Cat', avg_price: 10, delta_pct: 5, revenue: 100, units: 10 }]; }
  async getAlertsMovements(): Promise<AlertMovement[]> { return [{ type: 'price', product_code: 'p1', product_name: 'P1', category: 'Cat', delta_pct: 12, current: 11, previous: 10 }]; }
  async getPricingBaseline(): Promise<PricingBaseline|null> { return { product_code: 'p1', avg_price: 10, units_7d: 10, revenue_7d: 100, product_name: 'P1', category: 'Cat' }; }
  async getStockPredict(): Promise<StockPredict> { return { product_code: 'p1', stock_current: 10, avg_daily_sales: 2, days_to_stockout: 5, predicted_stockout_date: new Date().toISOString() }; }
  async getRadarTrends(): Promise<RadarTrendRow[]> { return [{ kind: 'category', id: 'Cat', revenue_cur: 100, revenue_prev: 80, growth_pct: 25, units_cur: 10 }]; }
  async getCompetitorPriceAvg(): Promise<number|null> { return 9.5; }
  async getOpportunitiesGainers(): Promise<GainerRow[]> { return [{ product_code: 'p1', name: 'P1', category: 'Cat', revenue_cur_7: 100, revenue_prev_7: 50, growth_7d: 100, revenue_cur_30: 300, revenue_prev_30: 200, growth_30d: 50, units_7d: 10 }]; }
}

function authCookie() {
  const token = jwt.sign({ sub: 'acc-1', account_id: 'acc-1', email: 't@e.com' }, 'dev-secret');
  return [`access_token=${token}`];
}

describe('BFF API', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'dev-secret';
  });
  const app = createApp();
  (app as any).locals.bffRepo = new FakeRepo();

  it('GET /bff/kpi/overview returns data', async () => {
    const res = await request(app).get('/bff/kpi/overview').set('Cookie', authCookie()).query({ period: 'last_7d', country: 'FR' });
    expect(res.status).toBe(200);
    expect(res.body.gmv).toBe(1000);
    expect(res.body.aov).toBeDefined();
  });

  it('GET /bff/products/:id/timeseries validates params', async () => {
    const res = await request(app).get('/bff/products/p1/timeseries').set('Cookie', authCookie()).query({ metrics: 'sales', from: new Date(Date.now()-86400000).toISOString(), to: new Date().toISOString() });
    expect(res.status).toBe(200);
    expect(res.body.series).toHaveLength(1);
  });

  it('GET /bff/competitors/diff returns array', async () => {
    const res = await request(app).get('/bff/competitors/diff').set('Cookie', authCookie()).query({ period: 'last_7d' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
