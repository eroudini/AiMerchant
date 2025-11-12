import nock from 'nock';
import { AmazonClient } from '../../src/connectors/amazon/client.js';
import { fetchAmazonListings, fetchAmazonProducts, fetchAmazonSalesDaily } from '../../src/connectors/amazon/ingest.js';

const BASE = 'https://sandbox.amazonapis.com';

describe('Amazon connector', () => {
  afterEach(() => nock.cleanAll());

  it('maps products', async () => {
    nock(BASE).get('/mock/products').query(true).reply(200, [
      { sku: 'SKU1', asin: null, title: 'P1', category: 'C', brand: 'B', cost: 10, currency: 'EUR' },
    ]);
    const client = new AmazonClient({});
    const rows = await fetchAmazonProducts(client, '00000000-0000-0000-0000-000000000001', 'FR');
    expect(rows[0].product_code).toBe('SKU1');
  });

  it('maps listings', async () => {
    nock(BASE).get('/mock/listings').query(true).reply(200, [
      { listingId: 'L1', sku: 'SKU1', url: 'https://example.com/l1' }
    ]);
    const client = new AmazonClient({});
    const rows = await fetchAmazonListings(client, '00000000-0000-0000-0000-000000000001', 'FR');
    expect(rows[0].marketplace_listing_id).toBe('L1');
  });

  it('maps sales', async () => {
    nock(BASE).get('/mock/sales').query(true).reply(200, [
      { sku: 'SKU1', ts: '2025-01-01T00:00:00Z', units: 2, revenue: 50, currency: 'EUR' }
    ]);
    const client = new AmazonClient({});
    const rows = await fetchAmazonSalesDaily(client, '00000000-0000-0000-0000-000000000001', 'FR', '2025-01-01T00:00:00Z');
    expect(rows[0].units_sold).toBe(2);
  });
});
