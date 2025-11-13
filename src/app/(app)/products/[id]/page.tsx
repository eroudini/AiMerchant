import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

async function fetchTimeseries(id: string, cookieHeader: string) {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 3600 * 1000);
  const qs = new URLSearchParams({
    metrics: 'sales,price,stock',
    from: from.toISOString(),
    to: to.toISOString(),
    granularity: 'day',
    order: 'asc',
  }).toString();
  const res = await fetch(`${API_BASE}/bff/products/${encodeURIComponent(id)}/timeseries?${qs}`, {
    headers: { 'Accept': 'application/json', Cookie: cookieHeader },
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  const cookieHeader = all.map((c: any) => `${c.name}=${c.value}`).join('; ');
  const id = decodeURIComponent(params.id);
  const data = await fetchTimeseries(id, cookieHeader);
  if (!data) return notFound();
  const series = Array.isArray(data.series) ? data.series : [];

  const byMetric: Record<string, { ts: string; value: number }[]> = {};
  for (const p of series) {
    if (!byMetric[p.metric]) byMetric[p.metric] = [];
    byMetric[p.metric].push({ ts: p.ts, value: p.value });
  }

  return (
    <div className="p-6 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Produit: <span className="text-amber-300">{id}</span></h1>
        <p className="text-sm text-neutral-400">Séries 30 jours — ventes, prix, stock</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['sales','price','stock'] as const).map((m) => (
          <div key={m} className="rounded-xl border border-white/10 bg-neutral-900/60 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur supports-[backdrop-filter]:bg-neutral-900/40">
            <div className="border-b border-white/10 px-4 py-3 text-sm text-neutral-300 capitalize">{m}</div>
            <div className="max-h-72 overflow-y-auto px-4 py-3 text-sm">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-left text-neutral-400">
                    <th className="py-1 pr-2 font-normal">Date</th>
                    <th className="py-1 pl-2 font-normal">Valeur</th>
                  </tr>
                </thead>
                <tbody>
                  {(byMetric[m] || []).map((p) => (
                    <tr key={`${m}-${p.ts}`} className="border-t border-white/5">
                      <td className="py-1 pr-2 text-neutral-300">{new Date(p.ts).toLocaleDateString('fr-FR')}</td>
                      <td className="py-1 pl-2 text-white/90">{m==='price' ? Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(p.value) : Math.round(p.value)}</td>
                    </tr>
                  ))}
                  {(!byMetric[m] || byMetric[m].length===0) && (
                    <tr><td colSpan={2} className="py-2 text-neutral-500">Aucune donnée</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
