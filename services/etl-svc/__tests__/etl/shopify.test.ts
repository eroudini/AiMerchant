import nock from 'nock';
import { ShopifyClient } from '../../src/connectors/shopify/client.js';
import { fetchShopifyCatalog, fetchShopifyOrders, fetchShopifyReturns } from '../../src/connectors/shopify/ingest.js';

describe('Shopify connector', () => {
  afterEach(() => nock.cleanAll());

  it('maps catalog', async () => {
    const BASE = 'https://myshop.myshopify.com';
    nock(BASE).get('/admin/api/2024-10/products.json').query(true).reply(200, {
      products: [
        { id: 1, title: 'P', product_type: 'Cat', vendor: 'Brand', variants: [{ sku: 'S1', presentment_prices: [{ price: { currency: 'EUR' } }] }] }
      ]
    });
    const client = new ShopifyClient({ shop: 'myshop', accessToken: 'x' });
    const rows = await fetchShopifyCatalog(client, '00000000-0000-0000-0000-000000000001', 'FR');
    expect(rows[0].product_code).toBe('S1');
  });

  it('maps orders and returns', async () => {
    const BASE = 'https://myshop.myshopify.com';
    nock(BASE).get('/admin/api/2024-10/orders.json').query(true).twice().reply(200, {
      orders: [
        { id: 10, currency: 'EUR', total_price: '50', created_at: '2025-01-01T00:00:00Z', processed_at: '2025-01-01T00:10:00Z',
          line_items: [{ id: 100, sku: 'S1', product_id: 1, quantity: 1 }],
          refunds: [{ id: 999, processed_at: '2025-01-01T01:00:00Z', refund_line_items: [{ line_item: { id: 100, sku: 'S1', product_id: 1 }, quantity: 1, subtotal_set: { shop_money: { amount: '50' } } }] }]
        }
      ]
    });
    const client = new ShopifyClient({ shop: 'myshop', accessToken: 'x' });
    const rows1 = await fetchShopifyOrders(client, '00000000-0000-0000-0000-000000000001', 'FR', '2025-01-01T00:00:00Z');
    const rows2 = await fetchShopifyReturns(client, '00000000-0000-0000-0000-000000000001', 'FR', '2025-01-01T00:00:00Z');
    expect(rows1.length).toBe(1);
    expect(rows2.length).toBe(1);
    expect(rows2[0].units_sold).toBeLessThan(0);
  });
});
