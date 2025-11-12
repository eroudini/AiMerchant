type Row = { competitor_id: string; avg_diff: number; observations: number };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function CompetitorsTable({ rows, country = 'FR', period = 'last_7d' }: { rows: Row[]; country?: string; period?: 'last_7d'|'last_30d'|'last_90d' }) {
  const exportHref = `${API_BASE}/bff/export/csv?resource=competitors_diff&period=${period}&country=${encodeURIComponent(country)}`;
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/60 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur supports-[backdrop-filter]:bg-neutral-900/40">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-medium text-white/90">Mouvements concurrents (Δ prix)</h2>
        <div className="flex items-center gap-3">
          <a href={exportHref} className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs text-neutral-300 hover:border-amber-500/30">Télécharger CSV</a>
          <span className="text-xs text-neutral-400">Top 10 — Période 7j</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-400">
              <th className="px-4 py-2 font-normal">Concurrent</th>
              <th className="px-4 py-2 font-normal">Δ moyen</th>
              <th className="px-4 py-2 font-normal">Obs.</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).slice(0, 10).map((r) => (
              <tr key={r.competitor_id} className="border-t border-white/5">
                <td className="px-4 py-2 text-white/90">{r.competitor_id}</td>
                <td className="px-4 py-2 text-white/90">{Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(r.avg_diff || 0)}</td>
                <td className="px-4 py-2 text-white/90">{r.observations}</td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr><td className="px-4 py-3 text-neutral-500" colSpan={3}>Aucune donnée concurrent pour la période</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
