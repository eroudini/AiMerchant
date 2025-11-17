import { Body, Controller, Post, Req } from '@nestjs/common';
import { Pool } from 'pg';
import { ActionsService } from '../actions/actions.service.js';
import { ForecastService } from '../forecast/forecast.service.js';

type RunBody = {
  account_id?: string;
  country?: string;
  horizon_days?: number; // default 14
  min_days_cover?: number; // default 7
  product_limit?: number; // default 200
  auto_execute?: boolean; // default from env (false)
  auto_execute_max_qty?: number; // default 50
};

@Controller('auto-action')
export class AutoActionController {
  private readonly pool = new Pool({ connectionString: process.env.ANALYTICS_DATABASE_URL || process.env.DATABASE_URL });

  constructor(private readonly actionsSvc: ActionsService, private readonly forecastSvc: ForecastService) {}

  @Post('run')
  async run(@Body() body: RunBody = {}, @Req() req: any) {
    const headerAccount = (req.headers['x-account-id'] as string) || undefined;
    const accountId = body.account_id || headerAccount;
    const country = body.country ?? process.env.AUTO_ACTION_COUNTRY;
    const horizon = Number(body.horizon_days ?? process.env.AUTO_ACTION_HORIZON_DAYS ?? 14);
    const minCover = Number(body.min_days_cover ?? process.env.AUTO_ACTION_MIN_DAYS_COVER ?? 7);
    const productLimit = Number(body.product_limit ?? process.env.AUTO_ACTION_MAX_PRODUCTS ?? 200);
    const autoExec = typeof body.auto_execute === 'boolean'
      ? body.auto_execute
      : (process.env.AUTO_EXECUTE_ENABLED || '0') === '1';
    const autoExecMaxQty = Number(body.auto_execute_max_qty ?? process.env.AUTO_EXECUTE_MAX_QTY ?? 50);

    const client = await this.pool.connect();
    const results: any[] = [];
    try {
      const accounts: string[] = [];
      if (accountId) {
        accounts.push(accountId);
      } else {
        const accRes = await client.query(`SELECT DISTINCT account_id FROM sales_daily LIMIT 50`);
        for (const r of accRes.rows) accounts.push(r.account_id);
      }

      for (const acc of accounts) {
        const params: any[] = [acc];
        let idx = params.length;
        const filters: string[] = [];
        if (country) { params.push(country); filters.push(`country = $${++idx}`); }
        const prodSql = `SELECT DISTINCT product_code FROM sales_daily WHERE account_id = $1 ${filters.length ? ' AND ' + filters.join(' AND ') : ''} ORDER BY product_code LIMIT ${productLimit}`;
        const prodRes = await client.query(prodSql, params);
        const productIds = prodRes.rows.map((r: any) => r.product_code).filter((v: any) => !!v);
        if (!productIds.length) {
          results.push({ account_id: acc, status: 'no-products' });
          continue;
        }

        await this.forecastSvc.recomputeForecast(acc, productIds, horizon, country);
        await this.actionsSvc.generateRecommendations(acc, { horizon_days: horizon, min_days_cover: minCover, country });

        let executed = 0;
        if (autoExec) {
          const recs = await this.actionsSvc.listRecommendations(acc, { status: 'draft', type: 'po', country });
          const idsToExec = recs
            .filter((r: any) => (r.payload?.suggested_qty ?? 0) > 0 && (r.payload?.suggested_qty ?? 0) <= autoExecMaxQty)
            .map((r: any) => r.id);
          if (idsToExec.length) {
            const res = await this.actionsSvc.execute(acc, { ids: idsToExec, note: `manual-auto-exec<=${autoExecMaxQty}` });
            executed = res.executed || 0;
          }
        }

        results.push({ account_id: acc, products: productIds.length, executed, country: country || null });
      }
      return { ok: true, horizon, minCover, country: country || null, productLimit, autoExec, autoExecMaxQty, results };
    } finally {
      client.release();
    }
  }
}
