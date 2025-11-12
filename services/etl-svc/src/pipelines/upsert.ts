import { query } from '../lib/db.js';
import { UnifiedListing, UnifiedProduct, UnifiedSaleTS, UnifiedFeesTS } from '../types.js';

export async function upsertProducts(rows: UnifiedProduct[]) {
  if (!rows.length) return 0;
  const values: any[] = [];
  const chunks: string[] = [];
  rows.forEach((r, i) => {
    const idx = i * 10;
    chunks.push(`($${idx + 1},$${idx + 2},$${idx + 3},$${idx + 4},$${idx + 5},$${idx + 6},$${idx + 7},$${idx + 8},$${idx + 9},$${idx + 10})`);
    values.push(r.account_id, r.marketplace, r.country, r.sku ?? null, r.asin ?? null, r.product_code, r.title ?? null, r.category ?? null, r.brand ?? null, r.currency_code ?? null);
  });
  const sql = `INSERT INTO product(id, account_id, marketplace, country, sku, asin, product_code, title, category, brand, currency_code, created_at)
               SELECT gen_random_uuid(), * , now() FROM (VALUES ${chunks.join(',')}) AS v(account_id, marketplace, country, sku, asin, product_code, title, category, brand, currency_code)
               ON CONFLICT (account_id, marketplace, country, product_code) DO UPDATE SET
                 title = EXCLUDED.title,
                 category = EXCLUDED.category,
                 brand = EXCLUDED.brand,
                 currency_code = EXCLUDED.currency_code`;
  const res = await query(sql, values);
  return (res as any).rowCount ?? rows.length;
}

export async function upsertListings(rows: UnifiedListing[]) {
  if (!rows.length) return 0;
  const values: any[] = [];
  const chunks: string[] = [];
  rows.forEach((r, i) => {
    const idx = i * 9;
    chunks.push(`($${idx + 1},$${idx + 2},$${idx + 3},$${idx + 4},$${idx + 5},$${idx + 6},$${idx + 7},$${idx + 8},$${idx + 9})`);
    values.push(r.account_id, r.product_code, r.marketplace, r.country, r.marketplace_listing_id, r.sku ?? null, r.asin ?? null, r.url ?? null, r.status ?? 'active');
  });
  const sql = `INSERT INTO listing(id, account_id, product_id, marketplace, country, marketplace_listing_id, sku, asin, url, status, created_at)
               SELECT gen_random_uuid(), l.account_id, p.id, l.marketplace, l.country, l.marketplace_listing_id, l.sku, l.asin, l.url, l.status, now()
               FROM (VALUES ${chunks.join(',')}) AS l(account_id, product_code, marketplace, country, marketplace_listing_id, sku, asin, url, status)
               JOIN product p ON p.account_id = l.account_id AND p.marketplace = l.marketplace AND p.country = l.country AND p.product_code = l.product_code
               ON CONFLICT (account_id, marketplace_listing_id) DO UPDATE SET url = EXCLUDED.url, status = EXCLUDED.status`;
  const res = await query(sql, values);
  return (res as any).rowCount ?? rows.length;
}

export async function upsertSales(rows: UnifiedSaleTS[]) {
  if (!rows.length) return 0;
  const values: any[] = [];
  const chunks: string[] = [];
  rows.forEach((r, i) => {
    const idx = i * 12;
    chunks.push(`($${idx + 1},$${idx + 2},$${idx + 3},$${idx + 4},$${idx + 5},$${idx + 6},$${idx + 7},$${idx + 8},$${idx + 9},$${idx + 10},$${idx + 11},$${idx + 12})`);
    values.push(r.account_id, r.marketplace, r.country, r.sku ?? null, r.asin ?? null, r.product_code, r.ts, r.units_sold, r.revenue, r.margin ?? null, r.cogs ?? null, r.currency_code);
  });
  const sql = `INSERT INTO sales_ts(account_id, marketplace, country, sku, asin, product_code, ts, units_sold, revenue, margin, cogs, currency_code)
               VALUES ${chunks.join(',')}
               ON CONFLICT (account_id, marketplace, country, product_code, ts)
               DO UPDATE SET units_sold = EXCLUDED.units_sold, revenue = EXCLUDED.revenue, margin = EXCLUDED.margin, cogs = EXCLUDED.cogs, currency_code = EXCLUDED.currency_code`;
  const res = await query(sql, values);
  return (res as any).rowCount ?? rows.length;
}

export async function upsertFees(rows: UnifiedFeesTS[]) {
  if (!rows.length) return 0;
  const values: any[] = [];
  const chunks: string[] = [];
  rows.forEach((r, i) => {
    const idx = i * 10;
    chunks.push(`($${idx + 1},$${idx + 2},$${idx + 3},$${idx + 4},$${idx + 5},$${idx + 6},$${idx + 7},$${idx + 8},$${idx + 9},$${idx + 10})`);
    values.push(r.account_id, r.marketplace, r.country, r.sku ?? null, r.asin ?? null, r.product_code, r.ts, r.fee_type, r.amount, r.currency_code);
  });
  const sql = `INSERT INTO fees_ts(account_id, marketplace, country, sku, asin, product_code, ts, fee_type, amount, currency_code)
               VALUES ${chunks.join(',')}
               ON CONFLICT (account_id, marketplace, country, product_code, ts, fee_type)
               DO UPDATE SET amount = EXCLUDED.amount, currency_code = EXCLUDED.currency_code`;
  const res = await query(sql, values);
  return (res as any).rowCount ?? rows.length;
}
