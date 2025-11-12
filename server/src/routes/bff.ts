import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateQuery, validateParams } from '../middleware/validateClass.js';
import { OverviewQueryDto, ProductTimeseriesParamsDto, ProductTimeseriesQueryDto, CompetitorsDiffQueryDto } from '../bff/dto.js';
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

export default router;
