import { AmazonClient } from './client.js';
import { UnifiedListing, UnifiedSaleTS, UnifiedProduct } from '../../types.js';

export async function fetchAmazonListings(client: AmazonClient, accountId: string, country: string): Promise<UnifiedListing[]> {
  if (process.env.MOCK === '1') {
    const items = [
      { listingId: 'L1', sku: 'SKU1', asin: null, url: 'https://amazon.example/L1', status: 'active' },
    ];
    return items.map((it) => ({
      account_id: accountId,
      marketplace: 'amazon',
      country,
      product_code: String(it.sku || it.asin || 'UNKNOWN'),
      marketplace_listing_id: it.listingId,
      sku: it.sku as string,
      asin: (it.asin ?? undefined) as string | undefined,
      url: it.url,
      status: (it.status as any) || 'active',
    }));
  }
  // Placeholder: SP-API endpoints (Listings, Catalog Items)
  const items = await client.get<any[]>('/mock/listings', { country });
  return items.map((it) => ({
    account_id: accountId,
    marketplace: 'amazon',
    country,
    product_code: it.sku || it.asin,
    marketplace_listing_id: it.listingId,
    sku: it.sku,
    asin: it.asin,
    url: it.url,
    status: it.status || 'active',
  }));
}

export async function fetchAmazonProducts(client: AmazonClient, accountId: string, country: string): Promise<UnifiedProduct[]> {
  if (process.env.MOCK === '1') {
    const items = [
      { sku: 'SKU1', asin: null, title: 'Produit 1', category: 'Cat', brand: 'Brand', cost: 10, currency: 'EUR' },
    ];
    return items.map((it) => ({
      account_id: accountId,
      marketplace: 'amazon',
      country,
      sku: it.sku as string,
      asin: (it.asin ?? undefined) as string | undefined,
      product_code: String(it.sku || it.asin || 'UNKNOWN'),
      title: it.title,
      category: it.category,
      brand: it.brand,
      cost: it.cost,
      currency_code: it.currency,
    }));
  }
  const items = await client.get<any[]>('/mock/products', { country });
  return items.map((it) => ({
    account_id: accountId,
    marketplace: 'amazon',
    country,
    sku: it.sku,
    asin: it.asin,
    product_code: it.sku || it.asin,
    title: it.title,
    category: it.category,
    brand: it.brand,
    cost: it.cost,
    currency_code: it.currency,
  }));
}

export async function fetchAmazonSalesDaily(client: AmazonClient, accountId: string, country: string, sinceISO: string): Promise<UnifiedSaleTS[]> {
  if (process.env.MOCK === '1') {
    const rows = [
      { sku: 'SKU1', ts: new Date().toISOString(), units: 2, revenue: 50, cogs: 30, margin: 20, currency: 'EUR' }
    ];
    return rows.map((r) => ({
      account_id: accountId,
      marketplace: 'amazon',
      country,
      product_code: r.sku,
      sku: r.sku,
      ts: r.ts,
      units_sold: r.units,
      revenue: r.revenue,
      cogs: r.cogs,
      margin: r.margin,
      currency_code: r.currency,
      attrs: null,
    }));
  }
  const rows = await client.get<any[]>('/mock/sales', { country, since: sinceISO });
  return rows.map((r) => ({
    account_id: accountId,
    marketplace: 'amazon',
    country,
    product_code: r.sku || r.asin,
    sku: r.sku,
    asin: r.asin,
    ts: r.ts,
    units_sold: r.units,
    revenue: r.revenue,
    cogs: r.cogs,
    margin: r.margin,
    currency_code: r.currency,
    attrs: r.attrs ?? null,
  }));
}

export async function fetchAmazonInventoryDaily(_client: AmazonClient, accountId: string, country: string, forDateISO: string): Promise<Array<{ account_id: string; product_code: string; country?: string; date: string; stock: number }>> {
  if (process.env.MOCK === '1') {
    const date = new Date(forDateISO).toISOString().slice(0, 10);
    return [{ account_id: accountId, product_code: 'SKU1', country, date, stock: 12 }];
  }
  // Placeholder: implement SP-API Inventory
  return [];
}

export async function fetchAmazonPriceDaily(_client: AmazonClient, accountId: string, country: string, forDateISO: string): Promise<Array<{ account_id: string; product_code: string; country?: string; date: string; price: number }>> {
  if (process.env.MOCK === '1') {
    const date = new Date(forDateISO).toISOString().slice(0, 10);
    return [{ account_id: accountId, product_code: 'SKU1', country, date, price: 25 }];
  }
  // Placeholder: implement SP-API Pricing
  return [];
}
