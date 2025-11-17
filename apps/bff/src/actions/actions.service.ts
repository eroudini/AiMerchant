import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { ExecuteActionsBody, GenerateRecommendationsBody, RecommendationRow } from './actions.dto.js';

@Injectable()
export class ActionsService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({ connectionString: process.env.ANALYTICS_DATABASE_URL || process.env.DATABASE_URL });
  }

  async generateRecommendations(accountId: string, body: GenerateRecommendationsBody = {}) {
    const horizon = Math.max(1, Number(body.horizon_days ?? 14));
    const minCover = Math.max(1, Number(body.min_days_cover ?? 7));
    const country = body.country;
    const productIds = body.product_ids && body.product_ids.length ? body.product_ids : undefined;

    const client = await this.pool.connect();
    try {
      // Latest inventory per product
      const invParams: any[] = [accountId];
      let idx = invParams.length;
      const invFilters: string[] = [];
      if (country) { invParams.push(country); invFilters.push(`country = $${++idx}`); }
      if (productIds) { invParams.push(productIds); invFilters.push(`product_code = ANY($${++idx})`); }

      const invSql = `
        WITH latest AS (
          SELECT account_id, product_code, country, stock, date,
                 ROW_NUMBER() OVER (PARTITION BY account_id, product_code, country ORDER BY date DESC) rn
          FROM inventory_daily
          WHERE account_id = $1 ${invFilters.length ? ' AND ' + invFilters.join(' AND ') : ''}
        )
        SELECT account_id, product_code, country, stock FROM latest WHERE rn = 1`;
      const invRes = await client.query(invSql, invParams);
      const inventory = invRes.rows as Array<{account_id: string; product_code: string; country: string; stock: number}>;

      // Forecast next horizon
      const fcParams: any[] = [accountId, horizon];
      idx = fcParams.length;
      const fcFilters: string[] = [];
      if (country) { fcParams.push(country); fcFilters.push(`country = $${++idx}`); }
      if (productIds) { fcParams.push(productIds); fcFilters.push(`product_code = ANY($${++idx})`); }

      const forecastSql = `
        SELECT account_id, product_code, country,
               SUM(yhat) AS demand_horizon,
               AVG(NULLIF(yhat,0)) AS avg_daily
        FROM forecast_product_daily
        WHERE account_id = $1
          AND date >= CURRENT_DATE
          AND date < CURRENT_DATE + ($2 || ' days')::interval
          ${fcFilters.length ? ' AND ' + fcFilters.join(' AND ') : ''}
        GROUP BY account_id, product_code, country`;
      const fcRes = await client.query(forecastSql, fcParams);
      const forecastMap = new Map<string, { demand: number; avg: number }>();
      for (const r of fcRes.rows) {
        const key = `${r.product_code}|${r.country}`;
        forecastMap.set(key, { demand: Number(r.demand_horizon || 0), avg: Number(r.avg_daily || 0) });
      }

      // Build recommendations
      const toInsert: Array<{ product_code: string; country: string | null; payload: any; note: string }> = [];
      for (const inv of inventory) {
        const key = `${inv.product_code}|${inv.country}`;
        const f = forecastMap.get(key) || { demand: 0, avg: 0 };
        const avgDaily = f.avg > 0 ? f.avg : (f.demand > 0 ? f.demand / horizon : 0);
        if (avgDaily <= 0) continue;
        const daysCover = inv.stock / avgDaily;
        if (daysCover < minCover) {
          const targetQty = Math.max(0, Math.ceil(minCover * avgDaily - inv.stock));
          if (targetQty > 0) {
            const payload = {
              kind: 'purchase_order',
              horizon_days: horizon,
              min_days_cover: minCover,
              stock: inv.stock,
              demand_horizon: Math.round((f.demand + Number.EPSILON) * 100) / 100,
              avg_daily: Math.round((avgDaily + Number.EPSILON) * 100) / 100,
              suggested_qty: targetQty,
              unit: 'units',
            };
            const note = `Réapprovisionnement recommandé: ${targetQty} unités pour ${minCover} jours de couverture`;
            toInsert.push({ product_code: inv.product_code, country: inv.country, payload, note });
          }
        }
      }

      if (!toInsert.length) return { inserted: 0 };

      // Avoid duplicates: remove existing drafts for same scope
      const delParams: any[] = [accountId];
      idx = delParams.length;
      const delFilters: string[] = ["type = 'po'", "status = 'draft'"];
      if (country) { delParams.push(country); delFilters.push(`country = $${++idx}`); }
      if (productIds) { delParams.push(productIds); delFilters.push(`product_code = ANY($${++idx})`); }
      const delSql = `DELETE FROM recommendation WHERE account_id = $1 AND ${delFilters.join(' AND ')}`;
      await client.query(delSql, delParams);

      // Batch insert
      const insertText = `INSERT INTO recommendation (account_id, product_code, country, type, status, payload, note)
                          VALUES ($1, $2, $3, 'po', 'draft', $4::jsonb, $5)`;
      for (const row of toInsert) {
        await client.query(insertText, [accountId, row.product_code, row.country, JSON.stringify(row.payload), row.note]);
      }
      return { inserted: toInsert.length };
    } finally {
      client.release();
    }
  }

  async listRecommendations(accountId: string, q: { status?: string; type?: string; country?: string }): Promise<RecommendationRow[]> {
    const params: any[] = [accountId];
    let idx = params.length;
    const filters: string[] = [];
    if (q.status) { params.push(q.status); filters.push(`status = $${++idx}`); }
    if (q.type) { params.push(q.type); filters.push(`type = $${++idx}`); }
    if (q.country) { params.push(q.country); filters.push(`country = $${++idx}`); }
    const sql = `SELECT id, account_id, product_code, country, type, status, payload, note, created_at
                 FROM recommendation
                 WHERE account_id = $1 ${filters.length ? ' AND ' + filters.join(' AND ') : ''}
                 ORDER BY created_at DESC LIMIT 200`;
    const res = await this.pool.query(sql, params);
    return res.rows as any;
  }

  async execute(accountId: string, body: ExecuteActionsBody) {
    if (!body.ids || !body.ids.length) return { executed: 0 };
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const sel = await client.query(
        `SELECT id, product_code, country, type, payload FROM recommendation
         WHERE account_id = $1 AND id = ANY($2) AND status = 'draft'`,
        [accountId, body.ids]
      );
      if (!sel.rows.length) { await client.query('ROLLBACK'); return { executed: 0 }; }

      // Mark executed
      await client.query(
        `UPDATE recommendation SET status = 'executed', note = COALESCE(note,'') || CASE WHEN $3 IS NULL THEN '' ELSE ' | ' || $3 END
         WHERE account_id = $1 AND id = ANY($2)`,
        [accountId, body.ids, body.note || null]
      );

      // Log executions
      const insertLog = `INSERT INTO action_execution_log (account_id, product_code, action_type, payload, status, message)
                         VALUES ($1, $2, $3, $4::jsonb, 'success', 'executed via BFF')`;
      for (const r of sel.rows) {
        await client.query(insertLog, [accountId, r.product_code, r.type, JSON.stringify(r.payload)]);
      }
      await client.query('COMMIT');
      return { executed: sel.rows.length };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
