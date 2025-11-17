import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Pool } from 'pg';
import { ActionsService } from '../../actions/actions.service.js';
import { ForecastService } from '../../forecast/forecast.service.js';

@Injectable()
export class ReplenishmentJob {
  private readonly logger = new Logger(ReplenishmentJob.name);
  private readonly pool = new Pool({ connectionString: process.env.ANALYTICS_DATABASE_URL || process.env.DATABASE_URL });

  // Runs daily at 03:15 by default; can override with CRON_SPEC
  @Cron(process.env.CRON_SPEC || CronExpression.EVERY_DAY_AT_3AM)
  async handleDaily() {
    if ((process.env.AUTO_ACTION_ENABLED || '1') !== '1') {
      this.logger.log('Auto-Action disabled; skip.');
      return;
    }
    const horizon = Number(process.env.AUTO_ACTION_HORIZON_DAYS || 14);
    const minCover = Number(process.env.AUTO_ACTION_MIN_DAYS_COVER || 7);
    const country = process.env.AUTO_ACTION_COUNTRY || undefined;
    const productLimit = Number(process.env.AUTO_ACTION_MAX_PRODUCTS || 200);
    const autoExec = (process.env.AUTO_EXECUTE_ENABLED || '0') === '1';
    const autoExecMaxQty = Number(process.env.AUTO_EXECUTE_MAX_QTY || 50);

    this.logger.log(`Starting Auto-Action run: horizon=${horizon}, minCover=${minCover}, country=${country || '*'}, limit=${productLimit}, autoExec=${autoExec}`);

    const client = await this.pool.connect();
    try {
      const accRes = await client.query(`SELECT DISTINCT account_id FROM sales_daily LIMIT 50`);
      for (const row of accRes.rows) {
        const accountId: string = row.account_id;
        try {
          // Discover active products for account
          const params: any[] = [accountId];
          let idx = params.length;
          const filters: string[] = [];
          if (country) { params.push(country); filters.push(`country = $${++idx}`); }
          const prodSql = `SELECT DISTINCT product_code FROM sales_daily WHERE account_id = $1 ${filters.length ? ' AND ' + filters.join(' AND ') : ''} ORDER BY product_code LIMIT ${productLimit}`;
          const prodRes = await client.query(prodSql, params);
          const productIds = prodRes.rows.map((r: any) => r.product_code).filter((v: any) => !!v);
          if (!productIds.length) {
            this.logger.log(`[${accountId}] No products found; skip.`);
            continue;
          }

          // Recompute forecasts
          await this.forecastSvc.recomputeForecast(accountId, productIds, horizon, country);
          this.logger.log(`[${accountId}] Forecast recomputed for ${productIds.length} products.`);

          // Generate recommendations
          await this.actionsSvc.generateRecommendations(accountId, { horizon_days: horizon, min_days_cover: minCover, country });
          this.logger.log(`[${accountId}] Recommendations generated.`);

          // Auto-execute small recommendations
          if (autoExec) {
            const recs = await this.actionsSvc.listRecommendations(accountId, { status: 'draft', type: 'po', country });
            const idsToExec = recs
              .filter((r: any) => (r.payload?.suggested_qty ?? 0) > 0 && (r.payload?.suggested_qty ?? 0) <= autoExecMaxQty)
              .map((r: any) => r.id);
            if (idsToExec.length) {
              await this.actionsSvc.execute(accountId, { ids: idsToExec, note: `auto-exec<=${autoExecMaxQty}` });
              this.logger.log(`[${accountId}] Auto-executed ${idsToExec.length} recommendations (<=${autoExecMaxQty}).`);
            } else {
              this.logger.log(`[${accountId}] No recommendations matched auto-exec criteria.`);
            }
          }
        } catch (e: any) {
          this.logger.error(`[${accountId}] Auto-Action error: ${e?.message || e}`);
        }
      }
    } finally {
      client.release();
    }
  }

  constructor(private readonly actionsSvc: ActionsService, private readonly forecastSvc: ForecastService) {}
}
