const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

async function doGet<T>(path: string, cookie?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Accept': 'application/json',
      ...(cookie ? { 'Cookie': cookie } : {}),
    },
    credentials: 'include',
    cache: 'no-store',
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`BFF ${path} ${res.status}`);
  const j = await res.json();
  return j as T;
}

export async function getOverview(opts: { period: 'last_7d'|'last_30d'|'last_90d'; country?: string; cookie?: string }): Promise<any> {
  const qs = new URLSearchParams({ period: opts.period, ...(opts.country ? { country: opts.country } : {}) }).toString();
  return doGet<any>(`/bff/kpi/overview?${qs}`, opts.cookie);
}

export async function getCompetitorsDiff(opts: { period: 'last_7d'|'last_30d'|'last_90d'; country?: string; category?: string; cookie?: string }): Promise<any[]> {
  const qs = new URLSearchParams({ period: opts.period, ...(opts.country ? { country: opts.country } : {}), ...(opts.category ? { category: opts.category } : {}) }).toString();
  return doGet<any[]>(`/bff/competitors/diff?${qs}`, opts.cookie);
}

export async function getMarketHeatmap(opts: { period: 'last_7d'; country?: string; cookie?: string }): Promise<any[]> {
  const qs = new URLSearchParams({ period: opts.period, ...(opts.country ? { country: opts.country } : {}) }).toString();
  return doGet<any[]>(`/bff/market/heatmap?${qs}`, opts.cookie);
}

export async function getAlertsMovements(opts: { period: 'last_7d'; country?: string; types?: ('price'|'stock')[]; threshold?: number; limit?: number; cookie?: string }): Promise<any[]> {
  const params: Record<string,string> = { period: opts.period };
  if (opts.country) params.country = opts.country;
  if (opts.types && opts.types.length) params.types = opts.types.join(',');
  if (typeof opts.threshold === 'number') params.threshold = String(opts.threshold);
  if (typeof opts.limit === 'number') params.limit = String(opts.limit);
  const qs = new URLSearchParams(params).toString();
  return doGet<any[]>(`/bff/alerts/movements?${qs}`, opts.cookie);
}

export async function getPricingSimulate(opts: { sku: string; delta: number; country?: string; cookie?: string }) {
  const params: Record<string,string> = { sku: opts.sku, delta: String(opts.delta) };
  if (opts.country) params.country = opts.country;
  const qs = new URLSearchParams(params).toString();
  return doGet(`/bff/pricing/simulate?${qs}`, opts.cookie);
}

export async function getStockPredict(opts: { product: string; lead_days?: number; country?: string; cookie?: string }) {
  const params: Record<string,string> = { product: opts.product };
  if (typeof opts.lead_days === 'number') params.lead_days = String(opts.lead_days);
  if (opts.country) params.country = opts.country;
  const qs = new URLSearchParams(params).toString();
  return doGet(`/bff/stock/predict?${qs}`, opts.cookie);
}

export async function getRadarTrends(opts: { period: 'last_30d'|'last_90d'; type?: 'category'|'product'; country?: string; limit?: number; cookie?: string }): Promise<any[]> {
  const params: Record<string,string> = { period: opts.period };
  if (opts.type) params.type = opts.type;
  if (opts.country) params.country = opts.country;
  if (typeof opts.limit === 'number') params.limit = String(opts.limit);
  const qs = new URLSearchParams(params).toString();
  return doGet<any[]>(`/bff/radar/trends?${qs}`, opts.cookie);
}
