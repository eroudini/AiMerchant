import request from 'supertest';
import { createApp } from '../src/app';
import jwt from 'jsonwebtoken';
import { BffRepo } from '../src/bff/repo';

class FakeRepo implements BffRepo {
  async getOverview() { return { gmv: 1000, net_margin: 300, units: 50, aov: 20 }; }
  async getProductTimeseries() { return [{ ts: new Date().toISOString(), value: 100, metric: 'sales' }]; }
  async getCompetitorsDiff() { return [{ competitor_id: 'c1', avg_diff: -2.5, observations: 10 }]; }
}

function authCookie() {
  const token = jwt.sign({ sub: 'acc-1', account_id: 'acc-1', email: 't@e.com' }, 'dev-secret');
  return [`access_token=${token}`];
}

describe('BFF API', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'dev-secret';
  });
  const app = createApp();
  (app as any).locals.bffRepo = new FakeRepo();

  it('GET /bff/kpi/overview returns data', async () => {
    const res = await request(app).get('/bff/kpi/overview').set('Cookie', authCookie()).query({ period: 'last_7d', country: 'FR' });
    expect(res.status).toBe(200);
    expect(res.body.gmv).toBe(1000);
    expect(res.body.aov).toBeDefined();
  });

  it('GET /bff/products/:id/timeseries validates params', async () => {
    const res = await request(app).get('/bff/products/p1/timeseries').set('Cookie', authCookie()).query({ metrics: 'sales', from: new Date(Date.now()-86400000).toISOString(), to: new Date().toISOString() });
    expect(res.status).toBe(200);
    expect(res.body.series).toHaveLength(1);
  });

  it('GET /bff/competitors/diff returns array', async () => {
    const res = await request(app).get('/bff/competitors/diff').set('Cookie', authCookie()).query({ period: 'last_7d' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
