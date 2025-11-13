import dotenv from 'dotenv';
import path from 'path';
import { BffService } from '../bff/service.js';

dotenv.config();

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : 'true';
      out[key] = val;
    }
  }
  return out;
}

(async () => {
  try {
    const argv = parseArgs();
    const productId = argv.productId || argv.product || 'csv';
    const country = argv.country || 'FR';
    const channel = argv.channel || 'AMAZON';
    const horizon = argv.horizon ? Number(argv.horizon) : undefined;

    // Sanity log
    console.log('[forecast:import] params', { productId, country, channel, horizon });

    // Ensure artifacts path exists (for information only)
  const artifactsDir = path.join(process.cwd(), '..', 'forecasting', 'artifacts');
    console.log('[forecast:import] artifacts root:', artifactsDir);

    // Service only needs Prisma for this method; repo is unused. Cast to any to avoid importing PgBffRepo.
    const svc = new BffService({} as any);
    const res = await svc.importForecastFromArtifacts(productId, country, channel, horizon);
    console.log('[forecast:import] done', res);
    process.exit(0);
  } catch (e: any) {
    console.error('[forecast:import] failed', e?.message || e);
    process.exit(1);
  }
})();
