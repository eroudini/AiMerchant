import 'dotenv/config';
import { logger } from './lib/logger.js';
import { startMetricsServer } from './lib/metrics.js';
import { runAmazonPipeline } from './pipelines/runAmazon.js';
import { runShopifyPipeline } from './pipelines/runShopify.js';
import { runDailyIngestion } from './pipelines/dailyIngestion.js';

const metricsServer = startMetricsServer();

async function main() {
  const source = process.argv[2]; // 'amazon' | 'shopify' | 'daily'
  const accountId = process.env.ACCOUNT_ID!; // UUID from unified DB
  const country = process.env.COUNTRY || 'FR';

  if (!source || !accountId) {
    logger.error('Usage: tsx src/index.ts <amazon|shopify|daily> (env: ACCOUNT_ID, COUNTRY, secrets)');
    process.exit(1);
  }

  try {
    if (source === 'amazon') {
      await runAmazonPipeline({ accountId, country });
    } else if (source === 'shopify') {
      const shop = process.env.SHOPIFY_SHOP!;
      await runShopifyPipeline({ accountId, country, shop });
    } else if (source === 'daily') {
      const date = process.env.DATE || undefined; // YYYY-MM-DD optional
      await runDailyIngestion({ accountId, country, date });
    } else {
      throw new Error(`Unknown source ${source}`);
    }
    logger.info({ source }, 'ETL run complete');
  } catch (err) {
    logger.error({ err }, 'ETL run failed');
    process.exitCode = 1;
  } finally {
    // give a bit of time for metrics scrape in ephemeral job
    setTimeout(() => metricsServer.close(), 200);
  }
}

main();
