import axios, { AxiosInstance } from 'axios';
import { createLimiter, withRetry } from '../../lib/rateLimiter.js';

// NOTE: This is a simplified client placeholder. Real SP-API requires LWA and SigV4.
export class AmazonClient {
  private http: AxiosInstance;
  private limiter = createLimiter({ minTime: Number(process.env.AMAZON_MIN_TIME || 250), maxConcurrent: 2 });

  constructor(private opts: { baseUrl?: string; accessToken?: string }) {
    this.http = axios.create({ baseURL: opts.baseUrl || 'https://sandbox.amazonapis.com' });
    this.http.interceptors.request.use((cfg) => {
      if (this.opts.accessToken) cfg.headers['Authorization'] = `Bearer ${this.opts.accessToken}`;
      return cfg;
    });
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    return this.limiter.schedule(() =>
      withRetry(async () => (await this.http.get<T>(path, { params })).data)
    );
  }
}
