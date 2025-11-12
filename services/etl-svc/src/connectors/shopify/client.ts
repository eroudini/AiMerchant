import axios, { AxiosInstance } from 'axios';
import { createLimiter, withRetry } from '../../lib/rateLimiter.js';

export class ShopifyClient {
  private http: AxiosInstance;
  private limiter = createLimiter({ minTime: Number(process.env.SHOPIFY_MIN_TIME || 200), maxConcurrent: 2 });

  constructor(opts: { shop: string; accessToken: string; apiVersion?: string }) {
    const { shop, accessToken, apiVersion = '2024-10' } = opts;
    this.http = axios.create({ baseURL: `https://${shop}.myshopify.com/admin/api/${apiVersion}` });
    this.http.interceptors.request.use((cfg) => {
      cfg.headers['X-Shopify-Access-Token'] = accessToken;
      return cfg;
    });
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    return this.limiter.schedule(() =>
      withRetry(async () => (await this.http.get<T>(path + '.json', { params })).data)
    );
  }
}
