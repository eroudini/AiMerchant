import { Pool } from 'pg';

export interface KpiOverview {
  gmv: number;
  net_margin: number;
  units: number;
  aov: number;
}

export interface TimeseriesPoint { ts: string; value: number; metric: string }

export interface CompetitorDiff { competitor_id: string; avg_diff: number; observations: number }
export interface MarketHeatmapRow { category: string; avg_price: number; delta_pct: number; revenue: number; units: number }
export interface AlertMovement { type: 'price'|'stock'; product_code: string; product_name?: string|null; category?: string|null; delta_pct: number; current: number; previous: number }
export interface PricingBaseline { product_code: string; avg_price?: number|null; units_7d: number; revenue_7d: number; product_name?: string|null; category?: string|null }
export interface StockPredict { product_code: string; stock_current: number|null; avg_daily_sales: number|null; days_to_stockout: number|null; predicted_stockout_date: string|null }
export interface RadarTrendRow { kind: 'category'|'product'; id: string; name?: string|null; category?: string|null; revenue_cur: number; revenue_prev: number; growth_pct: number; units_cur: number }

export interface BffRepo {
  getOverview(period: 'last_7d'|'last_30d'|'last_90d', country: string|undefined, accountId: string): Promise<KpiOverview>;
  getProductTimeseries(productCode: string, metrics: string[], from: string, to: string, granularity: 'day'|'hour', order: 'asc'|'desc', limit?: number, accountId?: string, country?: string): Promise<TimeseriesPoint[]>;
  getCompetitorsDiff(period: 'last_7d'|'last_30d'|'last_90d', country: string|undefined, accountId: string): Promise<CompetitorDiff[]>;
  getMarketHeatmap(period: 'last_7d', country: string|undefined, accountId: string): Promise<MarketHeatmapRow[]>;
  getAlertsMovements(period: 'last_7d', country: string|undefined, accountId: string, types: ('price'|'stock')[], thresholdPct: number, limit: number): Promise<AlertMovement[]>;
  getPricingBaseline(productCode: string, country: string|undefined, accountId: string): Promise<PricingBaseline|null>;
  getStockPredict(productCode: string, country: string|undefined, accountId: string, leadDays: number): Promise<StockPredict>;
  getRadarTrends(period: 'last_30d'|'last_90d', type: 'category'|'product', country: string|undefined, accountId: string, limit: number): Promise<RadarTrendRow[]>;
  getCompetitorPriceAvg(productCode: string, country: string|undefined, accountId: string): Promise<number|null>;
}

export class PgBffRepo implements BffRepo {
  private pool: Pool;
  constructor() {
    const conn = process.env.ANALYTICS_DATABASE_URL || process.env.DATABASE_URL;
    if (!conn) throw new Error('ANALYTICS_DATABASE_URL is required for BFF');
    this.pool = new Pool({ connectionString: conn });
  }

  async getOverview(period: 'last_7d'|'last_30d'|'last_90d', country: string|undefined, accountId: string): Promise<KpiOverview> {
    const view = period === 'last_7d' ? 'v_kpis_7d' : period === 'last_30d' ? 'v_kpis_30d' : 'v_kpis_90d';
    const sql = `SELECT gmv, net_margin, units, CASE WHEN units>0 THEN gmv/units ELSE 0 END AS aov FROM ${view} WHERE account_id=$1 ${country? 'AND country=$2':''} LIMIT 1`;
    const params: any[] = [accountId];
    if (country) params.push(country);
  const { rows } = await this.pool.query(sql, params);
  if (!rows[0]) return { gmv: 0, net_margin: 0, units: 0, aov: 0 };
  const r: any = rows[0];
  return { gmv: Number(r.gmv||0), net_margin: Number(r.net_margin||0), units: Number(r.units||0), aov: Number(r.aov||0) };
  }

  async getProductTimeseries(productCode: string, metrics: string[], from: string, to: string, granularity: 'day'|'hour', order: 'asc'|'desc', limit?: number, accountId?: string, country?: string): Promise<TimeseriesPoint[]> {
    const out: TimeseriesPoint[] = [];
    // sales
    if (metrics.includes('sales')) {
      const sql = `SELECT time_bucket('${granularity}', ts) AS ts, SUM(revenue) AS value FROM sales_ts WHERE product_code=$1 AND ts BETWEEN $2 AND $3 ${accountId? 'AND account_id=$4':''} ${country? 'AND country=$5':''} GROUP BY 1 ORDER BY 1 ${order} ${limit? 'LIMIT '+Number(limit):''}`;
      const params: any[] = [productCode, from, to];
      if (accountId) params.push(accountId);
      if (country) params.push(country);
  const { rows } = await this.pool.query(sql, params);
  (rows as any[]).forEach((r) => out.push({ ts: String(r.ts), value: Number(r.value||0), metric: 'sales' }));
    }
    // stock
    if (metrics.includes('stock')) {
      const sql = `SELECT time_bucket('${granularity}', ts) AS ts, LAST(value, ts) AS value FROM inventory_ts WHERE product_code=$1 AND ts BETWEEN $2 AND $3 ${accountId? 'AND account_id=$4':''} ${country? 'AND country=$5':''} GROUP BY 1 ORDER BY 1 ${order} ${limit? 'LIMIT '+Number(limit):''}`;
      const params: any[] = [productCode, from, to];
      if (accountId) params.push(accountId);
      if (country) params.push(country);
      try {
  const { rows } = await this.pool.query(sql, params);
  (rows as any[]).forEach((r) => out.push({ ts: String(r.ts), value: Number(r.value||0), metric: 'stock' }));
      } catch { /* table may not exist */ }
    }
    // price (optional, return empty if not available)
    if (metrics.includes('price')) {
      try {
        const sql = `SELECT time_bucket('${granularity}', ts) AS ts, AVG(price) AS value FROM price_ts WHERE product_code=$1 AND ts BETWEEN $2 AND $3 ${accountId? 'AND account_id=$4':''} ${country? 'AND country=$5':''} GROUP BY 1 ORDER BY 1 ${order} ${limit? 'LIMIT '+Number(limit):''}`;
        const params: any[] = [productCode, from, to];
        if (accountId) params.push(accountId);
        if (country) params.push(country);
  const { rows } = await this.pool.query(sql, params);
  (rows as any[]).forEach((r) => out.push({ ts: String(r.ts), value: Number(r.value||0), metric: 'price' }));
      } catch { /* optional */ }
    }
    return out;
  }

  async getCompetitorsDiff(period: 'last_7d'|'last_30d'|'last_90d', country: string|undefined, accountId: string): Promise<CompetitorDiff[]> {
    const interval = period === 'last_7d' ? '7 days' : period === 'last_30d' ? '30 days' : '90 days';
    const sql = `SELECT competitor_id, AVG(competitor_price - our_price) AS avg_diff, COUNT(*) AS observations
                 FROM comp_snapshot
                 WHERE account_id=$1 ${country? 'AND country=$2':''} AND ts >= now() - interval '${interval}'
                 GROUP BY competitor_id
                 ORDER BY ABS(AVG(competitor_price - our_price)) DESC
                 LIMIT 50`;
    const params: any[] = [accountId];
    if (country) params.push(country);
  const { rows } = await this.pool.query(sql, params);
  return (rows as any[]).map((r) => ({ competitor_id: String(r.competitor_id), avg_diff: Number(r.avg_diff||0), observations: Number(r.observations||0) }));
  }

  async getMarketHeatmap(_period: 'last_7d', country: string|undefined, accountId: string): Promise<MarketHeatmapRow[]> {
    // Approche: estimer le prix moyen catégorie = revenue/units sur 7j, comparer au 7j précédents
    const sql = `
      WITH cur AS (
        SELECT COALESCE(p.category,'Autre') AS category,
               SUM(s.revenue) AS revenue,
               SUM(s.units_sold) AS units
        FROM sales_ts s
        LEFT JOIN product p ON p.product_code = s.product_code AND p.account_id = s.account_id
        WHERE s.account_id=$1 ${country? 'AND s.country=$2':''}
          AND s.ts >= now() - interval '7 days'
        GROUP BY 1
      ), prev AS (
        SELECT COALESCE(p.category,'Autre') AS category,
               SUM(s.revenue) AS revenue,
               SUM(s.units_sold) AS units
        FROM sales_ts s
        LEFT JOIN product p ON p.product_code = s.product_code AND p.account_id = s.account_id
        WHERE s.account_id=$1 ${country? 'AND s.country=$2':''}
          AND s.ts >= now() - interval '14 days' AND s.ts < now() - interval '7 days'
        GROUP BY 1
      )
      SELECT c.category,
             CASE WHEN c.units>0 THEN c.revenue/c.units ELSE 0 END AS avg_price,
             c.revenue,
             c.units,
             CASE WHEN (CASE WHEN COALESCE(p.units,0)>0 THEN p.revenue/p.units ELSE 0 END) = 0 THEN 0
                  ELSE ((CASE WHEN c.units>0 THEN c.revenue/c.units ELSE 0 END) - (CASE WHEN COALESCE(p.units,0)>0 THEN p.revenue/p.units ELSE 0 END))
                       / NULLIF((CASE WHEN COALESCE(p.units,0)>0 THEN p.revenue/p.units ELSE 0 END),0) * 100 END AS delta_pct
      FROM cur c
      LEFT JOIN prev p ON p.category=c.category
      ORDER BY ABS(COALESCE(delta_pct,0)) DESC NULLS LAST, revenue DESC
      LIMIT 50`;
    const params: any[] = [accountId];
    if (country) params.push(country);
    const { rows } = await this.pool.query(sql, params);
    return (rows as any[]).map(r => ({
      category: String(r.category),
      avg_price: Number(r.avg_price||0),
      delta_pct: Number(r.delta_pct||0),
      revenue: Number(r.revenue||0),
      units: Number(r.units||0)
    }));
  }

  async getAlertsMovements(_period: 'last_7d', country: string|undefined, accountId: string, types: ('price'|'stock')[] = ['price','stock'], thresholdPct = 10, limit = 20): Promise<AlertMovement[]> {
    const alerts: AlertMovement[] = [];

    if (types.includes('price')) {
      try {
        const sqlPrice = `
          WITH cur AS (
            SELECT product_code, AVG(price) AS cur
            FROM price_ts
            WHERE account_id=$1 ${country? 'AND country=$2':''}
              AND ts >= now() - interval '7 days'
            GROUP BY 1
          ), prev AS (
            SELECT product_code, AVG(price) AS prev
            FROM price_ts
            WHERE account_id=$1 ${country? 'AND country=$2':''}
              AND ts >= now() - interval '14 days' AND ts < now() - interval '7 days'
            GROUP BY 1
          )
          SELECT 'price' AS type,
                 c.product_code,
                 p.name AS product_name,
                 p.category,
                 c.cur AS current,
                 pr.prev AS previous,
                 CASE WHEN pr.prev IS NULL OR pr.prev=0 THEN 0 ELSE (c.cur - pr.prev)/pr.prev * 100 END AS delta_pct
          FROM cur c
          LEFT JOIN prev pr ON pr.product_code=c.product_code
          LEFT JOIN product p ON p.product_code=c.product_code AND p.account_id=$1
          WHERE pr.prev IS NOT NULL
        ` + ` ORDER BY ABS(CASE WHEN pr.prev=0 THEN 0 ELSE (c.cur - pr.prev)/pr.prev * 100 END) DESC LIMIT ${Math.max(0, Math.min(200, limit*3))}`; // broader fetch before threshold filter
        const priceParams: any[] = [accountId];
        if (country) priceParams.push(country);
        const { rows } = await this.pool.query(sqlPrice, priceParams);
        for (const r of rows as any[]) {
          const delta = Number(r.delta_pct||0);
          if (Math.abs(delta) >= thresholdPct) {
            alerts.push({ type: 'price', product_code: String(r.product_code), product_name: r.product_name ?? null, category: r.category ?? null, delta_pct: delta, current: Number(r.current||0), previous: Number(r.previous||0) });
          }
        }
      } catch {
        // price_ts may not exist; ignore
      }
    }

    if (types.includes('stock')) {
      try {
        const sqlStock = `
          WITH cur AS (
            SELECT product_code, LAST(value, ts) AS cur
            FROM inventory_ts
            WHERE account_id=$1 ${country? 'AND country=$2':''}
              AND ts >= now() - interval '7 days'
            GROUP BY 1
          ), prev AS (
            SELECT product_code, LAST(value, ts) AS prev
            FROM inventory_ts
            WHERE account_id=$1 ${country? 'AND country=$2':''}
              AND ts >= now() - interval '14 days' AND ts < now() - interval '7 days'
            GROUP BY 1
          )
          SELECT 'stock' AS type,
                 COALESCE(c.product_code, pr.product_code) AS product_code,
                 p.name AS product_name,
                 p.category,
                 COALESCE(c.cur,0) AS current,
                 COALESCE(pr.prev,0) AS previous,
                 CASE WHEN COALESCE(pr.prev,0)=0 THEN 0 ELSE (COALESCE(c.cur,0) - COALESCE(pr.prev,0))/NULLIF(pr.prev,0) * 100 END AS delta_pct
          FROM cur c
          FULL JOIN prev pr ON pr.product_code=c.product_code
          LEFT JOIN product p ON p.product_code=COALESCE(c.product_code, pr.product_code) AND p.account_id=$1
        ` + ` ORDER BY ABS(CASE WHEN COALESCE(pr.prev,0)=0 THEN 0 ELSE (COALESCE(c.cur,0) - COALESCE(pr.prev,0))/NULLIF(pr.prev,0) * 100 END) DESC LIMIT ${Math.max(0, Math.min(200, limit*3))}`;
        const stockParams: any[] = [accountId];
        if (country) stockParams.push(country);
        const { rows } = await this.pool.query(sqlStock, stockParams);
        for (const r of rows as any[]) {
          const delta = Number(r.delta_pct||0);
          if (Math.abs(delta) >= thresholdPct) {
            alerts.push({ type: 'stock', product_code: String(r.product_code), product_name: r.product_name ?? null, category: r.category ?? null, delta_pct: delta, current: Number(r.current||0), previous: Number(r.previous||0) });
          }
        }
      } catch {
        // inventory_ts may not exist; ignore
      }
    }

    // sort combined, enforce final limit
    alerts.sort((a,b) => Math.abs(b.delta_pct) - Math.abs(a.delta_pct));
    return alerts.slice(0, limit);
  }

  async getPricingBaseline(productCode: string, country: string|undefined, accountId: string): Promise<PricingBaseline|null> {
    // Fetch 7d sales units and revenue, and avg price from price_ts if available; also fetch product name/category if present
    const salesSql = `
      SELECT SUM(units_sold) AS units, SUM(revenue) AS revenue
      FROM sales_ts
      WHERE account_id=$1 ${country? 'AND country=$2':''} AND product_code=$${country?3:2}
        AND ts >= now() - interval '7 days'`;
    const params: any[] = [accountId];
    if (country) params.push(country);
    params.push(productCode);
    const { rows } = await this.pool.query(salesSql, params);
    const s = rows[0];
    if (!s) return null;
    const units = Number(s.units||0);
    const revenue = Number(s.revenue||0);
    let avgPrice: number|null = null;
    try {
      const priceSql = `SELECT AVG(price) AS avg_price FROM price_ts WHERE account_id=$1 ${country? 'AND country=$2':''} AND product_code=$${country?3:2} AND ts >= now() - interval '7 days'`;
      const { rows: pr } = await this.pool.query(priceSql, params);
      avgPrice = pr[0]?.avg_price != null ? Number(pr[0].avg_price) : null;
    } catch { /* optional */ }
    let name: string|null = null;
    let category: string|null = null;
    try {
      const metaSql = `SELECT name, category FROM product WHERE account_id=$1 AND product_code=$2 LIMIT 1`;
      const { rows: meta } = await this.pool.query(metaSql, [accountId, productCode]);
      if (meta[0]) { name = meta[0].name ?? null; category = meta[0].category ?? null; }
    } catch { /* dim may not exist */ }
    return { product_code: productCode, avg_price: avgPrice, units_7d: units, revenue_7d: revenue, product_name: name, category };
  }

  async getStockPredict(productCode: string, country: string|undefined, accountId: string, leadDays: number): Promise<StockPredict> {
    // avg daily sales over last 7d
    const salesSql = `SELECT SUM(units_sold) AS units FROM sales_ts WHERE account_id=$1 ${country? 'AND country=$2':''} AND product_code=$${country?3:2} AND ts >= now() - interval '7 days'`;
    const params: any[] = [accountId];
    if (country) params.push(country);
    params.push(productCode);
    const { rows: srows } = await this.pool.query(salesSql, params);
    const units7 = Number(srows[0]?.units || 0);
    const avgDaily = units7 / 7;
    // current stock last value
    let stock: number|null = null;
    try {
      const stockSql = `SELECT value FROM inventory_ts WHERE account_id=$1 ${country? 'AND country=$2':''} AND product_code=$${country?3:2} ORDER BY ts DESC LIMIT 1`;
      const { rows: st } = await this.pool.query(stockSql, params);
      stock = st[0] ? Number(st[0].value) : null;
    } catch { /* optional */ }
    let days: number|null = null;
    if (stock != null && avgDaily > 0) days = stock / avgDaily;
    const predictedDate = days != null ? new Date(Date.now() + days * 24*3600*1000).toISOString() : null;
    // suggested reorder based on leadDays (not returned here; can compute client side)
    return { product_code: productCode, stock_current: stock, avg_daily_sales: avgDaily || null, days_to_stockout: days, predicted_stockout_date: predictedDate };
  }

  async getRadarTrends(period: 'last_30d'|'last_90d', type: 'category'|'product', country: string|undefined, accountId: string, limit: number): Promise<RadarTrendRow[]> {
    const interval = period === 'last_30d' ? '30 days' : '90 days';
    const prevStart = period === 'last_30d' ? "now() - interval '60 days'" : "now() - interval '180 days'";
    const curSql = type === 'category'
      ? `SELECT COALESCE(p.category,'Autre') AS id, SUM(s.revenue) AS revenue, SUM(s.units_sold) AS units
         FROM sales_ts s LEFT JOIN product p ON p.product_code=s.product_code AND p.account_id=s.account_id
         WHERE s.account_id=$1 ${country? 'AND s.country=$2':''} AND s.ts >= now() - interval '${interval}'
         GROUP BY 1`
      : `SELECT s.product_code AS id, SUM(s.revenue) AS revenue, SUM(s.units_sold) AS units, MAX(p.name) AS name, MAX(p.category) AS category
         FROM sales_ts s LEFT JOIN product p ON p.product_code=s.product_code AND p.account_id=s.account_id
         WHERE s.account_id=$1 ${country? 'AND s.country=$2':''} AND s.ts >= now() - interval '${interval}'
         GROUP BY 1`;
    const prevSql = type === 'category'
      ? `SELECT COALESCE(p.category,'Autre') AS id, SUM(s.revenue) AS revenue
         FROM sales_ts s LEFT JOIN product p ON p.product_code=s.product_code AND p.account_id=s.account_id
         WHERE s.account_id=$1 ${country? 'AND s.country=$2':''} AND s.ts >= ${prevStart} AND s.ts < now() - interval '${interval}'
         GROUP BY 1`
      : `SELECT s.product_code AS id, SUM(s.revenue) AS revenue
         FROM sales_ts s LEFT JOIN product p ON p.product_code=s.product_code AND p.account_id=s.account_id
         WHERE s.account_id=$1 ${country? 'AND s.country=$2':''} AND s.ts >= ${prevStart} AND s.ts < now() - interval '${interval}'
         GROUP BY 1`;

    const params: any[] = [accountId]; if (country) params.push(country);
    const { rows: curRows } = await this.pool.query(curSql, params);
    const { rows: prevRows } = await this.pool.query(prevSql, params);
    const prevMap = new Map<string, number>();
    (prevRows as any[]).forEach(r => prevMap.set(String(r.id), Number(r.revenue||0)));
    const out: RadarTrendRow[] = (curRows as any[]).map(r => {
      const id = String(r.id);
      const revCur = Number(r.revenue||0);
      const revPrev = Number(prevMap.get(id) || 0);
      const growth = revPrev === 0 ? (revCur > 0 ? 100 : 0) : ((revCur - revPrev)/revPrev)*100;
      const base: RadarTrendRow = {
        kind: type,
        id,
        revenue_cur: revCur,
        revenue_prev: revPrev,
        growth_pct: growth,
        units_cur: Number(r.units||0),
      } as any;
      if (type === 'product') { (base as any).name = r.name ?? null; (base as any).category = r.category ?? null; }
      return base;
    });
    out.sort((a,b) => Math.abs(b.growth_pct) - Math.abs(a.growth_pct) || b.revenue_cur - a.revenue_cur);
    return out.slice(0, limit);
  }

  async getCompetitorPriceAvg(productCode: string, country: string|undefined, accountId: string): Promise<number|null> {
    try {
      const sql = `SELECT AVG(competitor_price) AS avg
                   FROM comp_snapshot
                   WHERE account_id=$1 ${country? 'AND country=$2':''} AND product_code=$${country?3:2}
                     AND ts >= now() - interval '7 days'`;
      const params: any[] = [accountId]; if (country) params.push(country); params.push(productCode);
      const { rows } = await this.pool.query(sql, params);
      const v = rows[0]?.avg; return v != null ? Number(v) : null;
    } catch { return null; }
  }
}
