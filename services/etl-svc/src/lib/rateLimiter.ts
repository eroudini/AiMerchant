import Bottleneck from 'bottleneck';

export function createLimiter({ minTime = 200, maxConcurrent = 2 }: { minTime?: number; maxConcurrent?: number } = {}) {
  const limiter = new Bottleneck({ minTime, maxConcurrent });
  return limiter;
}

export async function withRetry<T>(fn: () => Promise<T>, opts: { retries?: number; baseMs?: number } = {}) {
  const retries = opts.retries ?? 5;
  const baseMs = opts.baseMs ?? 500;
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const status = err?.response?.status;
      const retryAfter = Number(err?.response?.headers?.['retry-after']) || 0;
      const backoff = retryAfter > 0 ? retryAfter * 1000 : baseMs * Math.pow(2, i);
      if (i === retries || (status && status < 500 && status !== 429)) throw err;
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr;
}
