import { ShopifyClient } from '../connectors/shopify/client.js';
import { fetchShopifyCatalog, fetchShopifyOrders, fetchShopifyReturns } from '../connectors/shopify/ingest.js';
import { etlRunDuration, etlRowsProcessed } from '../lib/metrics.js';
import { getWatermark, upsertWatermark, withRun, ensureEtlTables } from '../lib/db.js';
import { upsertProducts, upsertSales } from './upsert.js';

export async function runShopifyPipeline(opts: { accountId: string; shop: string; country: string }) {
  await ensureEtlTables();
  const endTimer = etlRunDuration.startTimer({ source: 'shopify', pipeline: 'daily' });
  try {
    const client = new ShopifyClient({ shop: opts.shop, accessToken: process.env.SHOPIFY_ACCESS_TOKEN! });

    const products = await fetchShopifyCatalog(client, opts.accountId, opts.country);
    etlRowsProcessed.inc({ source: 'shopify', table: 'product' }, products.length);
    await upsertProducts(products);

    const wm = await getWatermark('shopify', 'sales_ts', opts.accountId);
    const sinceISO = wm?.cursor_ts || new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const orders = await fetchShopifyOrders(client, opts.accountId, opts.country, sinceISO);
    const returns = await fetchShopifyReturns(client, opts.accountId, opts.country, sinceISO);
    const rows = [...orders, ...returns];
    etlRowsProcessed.inc({ source: 'shopify', table: 'sales_ts' }, rows.length);
    await upsertSales(rows);

    const latestTs = rows.reduce((max, r) => (r.ts > max ? r.ts : max), sinceISO);
    await upsertWatermark('shopify', 'sales_ts', opts.accountId, { cursor_ts: latestTs });
  } finally {
    endTimer();
  }
}
