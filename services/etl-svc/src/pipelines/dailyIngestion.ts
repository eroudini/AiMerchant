import { logger } from '../lib/logger.js';
import { ensureEtlTables, withRun } from '../lib/db.js';
import { fetchAmazonSalesDaily, fetchAmazonInventoryDaily, fetchAmazonPriceDaily } from '../connectors/amazon/ingest.js';
import { fetchShopifyOrders, fetchShopifyInventoryDaily, fetchShopifyPriceDaily } from '../connectors/shopify/ingest.js';
import { fetchGoogleTrendsDaily } from '../connectors/googleTrendsConnector.js';
import { fetchWeatherDaily } from '../connectors/weatherConnector.js';
import { upsertSalesDaily, upsertInventoryDaily, upsertPriceDaily, upsertGoogleTrendsDaily, upsertWeatherDaily } from './upsertDaily.js';
import { AmazonClient } from '../connectors/amazon/client.js';
import { ShopifyClient } from '../connectors/shopify/client.js';

function toDateOnly(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export async function runDailyIngestion(opts: { accountId: string; country: string; date?: string }) {
  await ensureEtlTables();
  const date = opts.date || toDateOnly(new Date().toISOString());
  await withRun('daily', 'consolidated', async () => {
    const accountId = opts.accountId;
    const country = opts.country;
      const amazon = new AmazonClient({ accessToken: process.env.AMAZON_ACCESS_TOKEN });

    // Amazon sales -> sales_daily
    try {
      const sinceISO = new Date(new Date(date).getTime() - 2 * 24 * 3600 * 1000).toISOString();
      const amz = await fetchAmazonSalesDaily(amazon, accountId, country, sinceISO);
      const salesRows = amz.map((r) => ({
        date: toDateOnly(r.ts),
        account_id: r.account_id,
        product_code: r.product_code,
        country: r.country,
        units_sold: r.units_sold,
        revenue: r.revenue,
      }));
      await upsertSalesDaily(salesRows);
    } catch (e) {
      logger.warn({ e }, 'amazon sales_daily ingestion skipped');
    }

    // Amazon inventory/price
    try {
      const inv = await fetchAmazonInventoryDaily(amazon, accountId, country, date);
      if (inv.length) await upsertInventoryDaily(inv.map((r) => ({ date: r.date, account_id: r.account_id, product_code: r.product_code, country: r.country, stock: r.stock })));
      const prices = await fetchAmazonPriceDaily(amazon, accountId, country, date);
      if (prices.length) await upsertPriceDaily(prices.map((r) => ({ date: r.date, account_id: r.account_id, product_code: r.product_code, country: r.country, price: r.price })));
    } catch (e) {
      logger.warn({ e }, 'amazon inventory/price ingestion skipped');
    }

    // Shopify orders -> sales_daily (marketplace field not stored in daily table; aggregation per product_code)
    try {
      const shop = process.env.SHOPIFY_SHOP;
      if (shop) {
  const shopify = new ShopifyClient({ shop, accessToken: process.env.SHOPIFY_TOKEN! });
        const sinceISO = new Date(new Date(date).getTime() - 2 * 24 * 3600 * 1000).toISOString();
        const ord = await fetchShopifyOrders(shopify, accountId, country, sinceISO);
        const agg = new Map<string, { units: number; revenue: number }>();
        for (const r of ord) {
          const key = `${r.product_code}|${toDateOnly(r.ts)}`;
          const cur = agg.get(key) || { units: 0, revenue: 0 };
          cur.units += r.units_sold;
          cur.revenue += r.revenue;
          agg.set(key, cur);
        }
        const rows = Array.from(agg.entries()).map(([k, v]) => {
          const [product_code, d] = k.split('|');
          return { date: d, account_id: accountId, product_code, country, units_sold: v.units, revenue: v.revenue };
        });
        if (rows.length) await upsertSalesDaily(rows);
      }
    } catch (e) {
      logger.warn({ e }, 'shopify sales_daily ingestion skipped');
    }

    // Shopify inventory/price
    try {
      const shop = process.env.SHOPIFY_SHOP;
      if (shop) {
        const shopify = new ShopifyClient({ shop, accessToken: process.env.SHOPIFY_TOKEN! });
        const inv = await fetchShopifyInventoryDaily(shopify, accountId, country, date);
        if (inv.length) await upsertInventoryDaily(inv.map((r) => ({ date: r.date, account_id: r.account_id, product_code: r.product_code, country: r.country, stock: r.stock })));
        const prices = await fetchShopifyPriceDaily(shopify, accountId, country, date);
        if (prices.length) await upsertPriceDaily(prices.map((r) => ({ date: r.date, account_id: r.account_id, product_code: r.product_code, country: r.country, price: r.price })));
      }
    } catch (e) {
      logger.warn({ e }, 'shopify inventory/price ingestion skipped');
    }

    // External signals
    try {
      const start = date;
      const end = date;
      const keyword = process.env.TRENDS_KEYWORD || 'brand';
      const trends = await fetchGoogleTrendsDaily(keyword, country, start, end);
      await upsertGoogleTrendsDaily(trends.map((t) => ({ keyword: t.keyword, country: t.country, date: t.date, score: t.score })));
    } catch (e) {
      logger.warn({ e }, 'google trends ingestion skipped');
    }

    try {
      const city = process.env.WEATHER_CITY || 'Paris';
      const rows = await fetchWeatherDaily(country, city, date, date);
      await upsertWeatherDaily(rows.map((w) => ({ date: w.date, country: w.country, city: w.city, temp_avg_c: w.temp_avg_c, rain_mm: w.rain_mm, wind_kmh: w.wind_kmh })));
    } catch (e) {
      logger.warn({ e }, 'weather ingestion skipped');
    }
  });
}
