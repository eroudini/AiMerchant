"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function QuickExports({ period, country, category }: { period: string; country?: string; category?: string }) {
  const base = API_BASE;
  const mk = (resource: string, extra: Record<string, string | number | undefined> = {}) => {
    const u = new URL(base + '/bff/export/csv');
    u.searchParams.set('resource', resource);
    Object.entries(extra).forEach(([k, v]) => v != null && u.searchParams.set(k, String(v)));
    if (country) u.searchParams.set('country', country);
    if (category) u.searchParams.set('category', category);
    return u.toString();
  };
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <a className="rounded-md border border-white/10 px-3 py-1 hover:border-amber-500/30" target="_blank" href={mk('market_heatmap', { period: 'last_7d' })}>Export Heatmap</a>
  <a className="rounded-md border border-white/10 px-3 py-1 hover:border-amber-500/30" target="_blank" href={mk('competitors_diff', { period })}>Export Concurrents</a>
      <a className="rounded-md border border-white/10 px-3 py-1 hover:border-amber-500/30" target="_blank" href={mk('alerts_movements', { period: 'last_7d', limit: 200 })}>Export Alertes</a>
      <a className="rounded-md border border-white/10 px-3 py-1 hover:border-amber-500/30" target="_blank" href={mk('radar_trends', { period: period === 'last_7d' ? 'last_30d' : period, type: 'product', limit: 200 })}>Export Radar (produits)</a>
    </div>
  );
}
