import { cookies } from 'next/headers';
import Link from 'next/link';
import ExportCsv from '@/components/ui/ExportCsv';
import { getOpportunitiesGainers } from '../../../../client/lib/bff';

export const dynamic = 'force-dynamic';

function pct(v: number) {
  const r = Math.round(v);
  return (r >= 0 ? '+' : '') + r + '%';
}

export default async function OpportunitiesPage({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const sp = searchParams ? await searchParams : {} as Record<string,string>;
  const period = (sp.period === 'last_30d' ? 'last_30d' : 'last_7d') as 'last_7d'|'last_30d';
  const country = sp.country || 'FR';
  const sort = (sp.sort === 'revenue' ? 'revenue' : 'growth') as 'growth'|'revenue';
  const limit = sp.limit ? Math.max(1, Math.min(200, Number(sp.limit))) : 50;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c: any) => `${c.name}=${c.value}`).join('; ');

  let rows: any[] = [];
  try {
    rows = await getOpportunitiesGainers({ period, country, limit, sort, cookie: cookieHeader });
  } catch {}

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-white/90">Opportunités — Gainers</h1>

      <form className="flex flex-wrap items-end gap-3" method="get">
        <div>
          <label className="block text-sm text-neutral-400">Période</label>
          <select name="period" defaultValue={period} className="bg-neutral-900 border border-white/10 rounded px-3 py-2">
            <option value="last_7d">7 jours</option>
            <option value="last_30d">30 jours</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-neutral-400">Pays</label>
          <input name="country" defaultValue={country} className="bg-neutral-900 border border-white/10 rounded px-3 py-2 w-24" />
        </div>
        <div>
          <label className="block text-sm text-neutral-400">Tri</label>
          <select name="sort" defaultValue={sort} className="bg-neutral-900 border border-white/10 rounded px-3 py-2 w-36">
            <option value="growth">Croissance</option>
            <option value="revenue">Revenu</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-neutral-400">Limite</label>
          <input name="limit" defaultValue={String(limit)} className="bg-neutral-900 border border-white/10 rounded px-3 py-2 w-24" />
        </div>
        <button type="submit" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Mettre à jour</button>
      </form>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900/60">
            <tr>
              <th className="text-left px-3 py-2">Produit</th>
              <th className="text-left px-3 py-2">Catégorie</th>
              <th className="text-right px-3 py-2">Revenu 7j</th>
              <th className="text-right px-3 py-2">Croissance 7j</th>
              <th className="text-right px-3 py-2">Revenu 30j</th>
              <th className="text-right px-3 py-2">Croissance 30j</th>
              <th className="text-right px-3 py-2">Unités 7j</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.product_code} className="odd:bg-neutral-950/40">
                <td className="px-3 py-2 text-amber-300"><Link href={`/products/${encodeURIComponent(r.product_code)}`}>{r.name || r.product_code}</Link></td>
                <td className="px-3 py-2">{r.category || '—'}</td>
                <td className="px-3 py-2 text-right">{Math.round(r.revenue_cur_7 || 0)}</td>
                <td className={`px-3 py-2 text-right ${Number(r.growth_7d)>=0 ? 'text-emerald-400' : 'text-rose-400'}`}>{pct(Number(r.growth_7d||0))}</td>
                <td className="px-3 py-2 text-right">{Math.round(r.revenue_cur_30 || 0)}</td>
                <td className={`px-3 py-2 text-right ${Number(r.growth_30d)>=0 ? 'text-emerald-400' : 'text-rose-400'}`}>{pct(Number(r.growth_30d||0))}</td>
                <td className="px-3 py-2 text-right">{Math.round(r.units_7d || 0)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-4 text-center text-neutral-500">Aucune donnée</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-500">{country} · {period} · tri {sort} · {rows.length} lignes</div>
        <ExportCsv rows={rows} />
      </div>
    </div>
  );
}
