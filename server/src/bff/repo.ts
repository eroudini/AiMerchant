import { Pool } from 'pg';

export interface KpiOverview {
  gmv: number;
  net_margin: number;
  units: number;
  aov: number;
}

export interface TimeseriesPoint { ts: string; value: number; metric: string }

export interface CompetitorDiff { competitor_id: string; avg_diff: number; observations: number }

export interface BffRepo {
  getOverview(period: 'last_7d'|'last_30d'|'last_90d', country: string|undefined, accountId: string): Promise<KpiOverview>;
  getProductTimeseries(productCode: string, metrics: string[], from: string, to: string, granularity: 'day'|'hour', order: 'asc'|'desc', limit?: number, accountId?: string, country?: string): Promise<TimeseriesPoint[]>;
  getCompetitorsDiff(period: 'last_7d'|'last_30d'|'last_90d', country: string|undefined, accountId: string): Promise<CompetitorDiff[]>;
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
}
