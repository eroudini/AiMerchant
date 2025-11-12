import { BffRepo, KpiOverview, TimeseriesPoint, CompetitorDiff } from './repo.js';

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
}
