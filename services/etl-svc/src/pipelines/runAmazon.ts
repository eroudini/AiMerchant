import { AmazonClient } from '../connectors/amazon/client.js';
import { fetchAmazonListings, fetchAmazonProducts, fetchAmazonSalesDaily } from '../connectors/amazon/ingest.js';
import { etlRunDuration, etlRowsProcessed } from '../lib/metrics.js';
import { getWatermark, upsertWatermark, withRun, ensureEtlTables } from '../lib/db.js';
import { upsertProducts, upsertListings, upsertSales } from './upsert.js';

export async function runAmazonPipeline(opts: { accountId: string; country: string }) {
  await ensureEtlTables();
  const endTimer = etlRunDuration.startTimer({ source: 'amazon', pipeline: 'daily' });
  try {
    const client = new AmazonClient({ accessToken: process.env.AMAZON_ACCESS_TOKEN });

    // Catalog & listings (idempotent upsert)
    const products = await fetchAmazonProducts(client, opts.accountId, opts.country);
    etlRowsProcessed.inc({ source: 'amazon', table: 'product' }, products.length);
    await upsertProducts(products);

    const listings = await fetchAmazonListings(client, opts.accountId, opts.country);
    etlRowsProcessed.inc({ source: 'amazon', table: 'listing' }, listings.length);
    await upsertListings(listings);

    // Sales since watermark
    const wm = await getWatermark('amazon', 'sales_ts', opts.accountId);
    const sinceISO = wm?.cursor_ts || new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const sales = await fetchAmazonSalesDaily(client, opts.accountId, opts.country, sinceISO);
    etlRowsProcessed.inc({ source: 'amazon', table: 'sales_ts' }, sales.length);
    await upsertSales(sales);

    // Update watermark to latest ts observed
    const latestTs = sales.reduce((max, r) => (r.ts > max ? r.ts : max), sinceISO);
    await upsertWatermark('amazon', 'sales_ts', opts.accountId, { cursor_ts: latestTs });
  } finally {
    endTimer();
  }
}
