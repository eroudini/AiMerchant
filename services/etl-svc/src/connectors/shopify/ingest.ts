import { ShopifyClient } from './client.js';
import { UnifiedProduct, UnifiedListing, UnifiedSaleTS } from '../../types.js';

export async function fetchShopifyCatalog(client: ShopifyClient, accountId: string, country: string): Promise<UnifiedProduct[]> {
  if (process.env.MOCK === '1') {
    const products = [
      { id: 1, title: 'P', product_type: 'Cat', vendor: 'Brand', variants: [{ sku: 'S1', presentment_prices: [{ price: { currency: 'EUR' } }] }] }
    ];
    return products.map((p) => ({
      account_id: accountId,
      marketplace: 'shopify',
      country,
      sku: p.variants?.[0]?.sku || undefined,
      product_code: String(p.variants?.[0]?.sku || p.id),
      title: p.title,
      category: p.product_type,
      brand: p.vendor,
      currency_code: p.variants?.[0]?.presentment_prices?.[0]?.price?.currency || undefined,
    }));
  }
  const data = await client.get<{ products: any[] }>('/products');
  return data.products.map((p) => ({
    account_id: accountId,
    marketplace: 'shopify',
    country,
    sku: p.variants?.[0]?.sku || undefined,
    product_code: String(p.variants?.[0]?.sku || p.id),
    title: p.title,
    category: p.product_type,
    brand: p.vendor,
    currency_code: p.variants?.[0]?.presentment_prices?.[0]?.price?.currency || undefined,
  }));
}

export async function fetchShopifyOrders(client: ShopifyClient, accountId: string, country: string, sinceISO: string): Promise<UnifiedSaleTS[]> {
  if (process.env.MOCK === '1') {
    const orders = [{ id: 10, currency: 'EUR', total_price: '50', created_at: new Date().toISOString(), processed_at: new Date().toISOString(), line_items: [{ id: 100, sku: 'S1', product_id: 1, quantity: 1 }] }];
    const rows: UnifiedSaleTS[] = [];
    for (const o of orders) {
      for (const li of o.line_items || []) {
        rows.push({
          account_id: accountId,
          marketplace: 'shopify',
          country,
          product_code: String(li.sku || li.product_id),
          sku: li.sku,
          ts: o.processed_at || o.created_at,
          units_sold: li.quantity,
          revenue: Number(o.total_price || 0),
          cogs: undefined,
          margin: undefined,
          currency_code: o.currency,
          attrs: { order_id: o.id, line_item_id: li.id },
        });
      }
    }
    return rows;
  }
  const data = await client.get<{ orders: any[] }>('/orders', { status: 'any', created_at_min: sinceISO });
  const rows: UnifiedSaleTS[] = [];
  for (const o of data.orders) {
    for (const li of o.line_items || []) {
      rows.push({
        account_id: accountId,
        marketplace: 'shopify',
        country,
  product_code: String(li.sku || li.product_id),
        sku: li.sku,
        ts: o.processed_at || o.created_at,
        units_sold: li.quantity,
        revenue: Number(o.total_price || 0),
        cogs: undefined,
        margin: undefined,
        currency_code: o.currency,
        attrs: { order_id: o.id, line_item_id: li.id },
      });
    }
  }
  return rows;
}

export async function fetchShopifyReturns(client: ShopifyClient, accountId: string, country: string, sinceISO: string): Promise<UnifiedSaleTS[]> {
  // Simplified placeholder: derive returns as negative lines from refunds endpoint
  if (process.env.MOCK === '1') {
    const orders = [{ id: 10, currency: 'EUR', updated_at: new Date().toISOString(), refunds: [{ id: 999, processed_at: new Date().toISOString(), refund_line_items: [{ line_item: { id: 100, sku: 'S1', product_id: 1 }, quantity: 1, subtotal_set: { shop_money: { amount: '50' } } }] }] }];
    const rows: UnifiedSaleTS[] = [];
    for (const o of orders) {
      for (const rf of o.refunds || []) {
        for (const li of rf.refund_line_items || []) {
          rows.push({
            account_id: accountId,
            marketplace: 'shopify',
            country,
            product_code: String(li.line_item?.sku || li.line_item?.product_id),
            sku: li.line_item?.sku,
            ts: rf.processed_at || o.updated_at,
            units_sold: -Math.abs(li.quantity || 1),
            revenue: -Math.abs(Number(li.subtotal_set?.shop_money?.amount || 0)),
            currency_code: o.currency,
            attrs: { order_id: o.id, refund_id: rf.id },
          });
        }
      }
    }
    return rows;
  }
  const data = await client.get<{ orders: any[] }>('/orders', { status: 'any', updated_at_min: sinceISO });
  const rows: UnifiedSaleTS[] = [];
  for (const o of data.orders) {
    for (const rf of o.refunds || []) {
      for (const li of rf.refund_line_items || []) {
        rows.push({
          account_id: accountId,
          marketplace: 'shopify',
          country,
          product_code: String(li.line_item?.sku || li.line_item?.product_id),
          sku: li.line_item?.sku,
          ts: rf.processed_at || o.updated_at,
          units_sold: -Math.abs(li.quantity || 1),
          revenue: -Math.abs(Number(li.subtotal_set?.shop_money?.amount || 0)),
          currency_code: o.currency,
          attrs: { order_id: o.id, refund_id: rf.id },
        });
      }
    }
  }
  return rows;
}
