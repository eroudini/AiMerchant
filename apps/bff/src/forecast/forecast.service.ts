import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { ForecastOverviewResponse } from './forecast.dto.js';

@Injectable()
export class ForecastService {
  private pool: Pool;
  private forecastUrl: string;

  constructor() {
    this.pool = new Pool({ connectionString: process.env.ANALYTICS_DATABASE_URL || process.env.DATABASE_URL });
    this.forecastUrl = process.env.FORECAST_SERVICE_URL || 'http://localhost:8000';
  }

  async getOverview(accountId: string, period: 'last_7d'|'last_30d'|'last_90d', country?: string): Promise<ForecastOverviewResponse> {
    const days = period === 'last_7d' ? 7 : period === 'last_30d' ? 30 : 90;
    const client = await this.pool.connect();
    try {
      const params = [accountId, days, country];
      const whereCountry = country ? 'AND sd.country = $3' : '';
      const topSql = `
        WITH base AS (
          SELECT sd.product_code,
                 SUM(CASE WHEN sd.date >= CURRENT_DATE - INTERVAL '7 days' THEN sd.units_sold ELSE 0 END) AS u7,
                 SUM(CASE WHEN sd.date >= CURRENT_DATE - INTERVAL '30 days' THEN sd.units_sold ELSE 0 END) AS u30
          FROM sales_daily sd
          WHERE sd.account_id = $1
            ${whereCountry}
          GROUP BY sd.product_code
        )
        SELECT product_code, (NULLIF(u7,0))::float/(NULLIF(u30,0))::float AS growth
        FROM base
        ORDER BY growth DESC NULLS LAST LIMIT 10`;
      const losersSql = topSql.replace('DESC', 'ASC');
      const top = await client.query(topSql, params.slice(0, country ? 3 : 2));
      const losers = await client.query(losersSql, params.slice(0, country ? 3 : 2));
      const total = await client.query(
        `SELECT COUNT(DISTINCT product_code) AS total_products, SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '30 days' THEN units_sold ELSE 0 END) AS total_units_30d
         FROM sales_daily WHERE account_id = $1`,
        [accountId]
      );
      return {
        top_gainers: top.rows.map((r: any) => ({ product_id: r.product_code, growth_7d: Number(r.growth || 0) })),
        top_losers: losers.rows.map((r: any) => ({ product_id: r.product_code, growth_7d: Number(r.growth || 0) })),
        aggregates: { total_products: Number(total.rows[0].total_products || 0), total_units_30d: Number(total.rows[0].total_units_30d || 0) },
      };
    } finally {
      client.release();
    }
  }

  async recomputeForecast(accountId: string, productIds: string[], horizonDays: number, country?: string) {
    const payload = { account_id: accountId, product_ids: productIds, horizon_days: horizonDays, country };
    const url = `${this.forecastUrl}/forecast/run`;
    const res = await axios.post(url, payload, { timeout: 60_000 });
    return res.data;
  }
}
