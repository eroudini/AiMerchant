type CountryDelta = {
  label: string;
  delta: number; // en %
};

export default function DemandForecastMinimal(props: {
  title?: string;
  daysAhead: number;
  countries: CountryDelta[];
  highProductName: string;
  highDeltaPct: number; // en %
  cta: string; // bouton
  reasons: string[];
  decliningName: string;
  decliningDeltaPct: number; // en %
  decliningNote: string;
}) {
  const {
    title = 'Prévision de demande',
    daysAhead,
    countries,
    highProductName,
    highDeltaPct,
    cta,
    reasons,
    decliningName,
    decliningDeltaPct,
    decliningNote,
  } = props;

  function formatDelta(value: number): string {
    if (value === null || value === undefined || !isFinite(value)) return '—';
    const v = Math.round(value);
    const sign = v > 0 ? '+' : '';
    return `${sign}${v}%`;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm space-y-5">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-white/90">{title}</h1>
        <p className="text-xs text-neutral-400">{daysAhead} jours à venir</p>
      </header>

      {/* Pays */}
      {countries?.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-3">
          {countries.map((c) => (
            <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex flex-col gap-1">
              <span className="text-xs text-neutral-400">{c.label}</span>
              <span className={`text-sm font-medium ${c.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatDelta(c.delta)}</span>
            </div>
          ))}
        </section>
      )}

      {/* Produit en forte demande + action */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 p-4 space-y-2 bg-white/5">
          <p className="text-xs font-medium text-orange-400">Produit en forte demande</p>
          <h2 className="text-sm font-semibold text-white/90">{highProductName}</h2>
          <p className={`text-sm font-medium ${highDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatDelta(highDeltaPct)} demande attendue
          </p>
          {/* Faux mini-graphique (visuel) */}
          <div className="mt-2 h-16 w-full rounded-xl bg-gradient-to-tr from-blue-900/20 to-blue-500/20 flex items-end">
            <div className="ml-auto mr-2 h-12 w-16 rounded-t-full bg-blue-500/40" />
          </div>
        </div>

        {/* Action suggérée */}
        <div className="rounded-2xl border border-white/10 p-4 space-y-3 bg-white/5">
          <h3 className="text-sm font-semibold text-white/90">Action suggérée</h3>
          <button className="w-full rounded-lg bg-blue-600/90 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600">
            {cta}
          </button>
          {reasons?.length > 0 && (
            <ul className="list-disc pl-4 text-xs text-neutral-300 space-y-1">
              {reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Produit en baisse */}
      <section className="rounded-2xl border border-white/10 p-4 space-y-2 bg-white/5">
        <h3 className="text-sm font-semibold text-white/90">Produits en baisse de demande</h3>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white/90">{decliningName}</p>
            <p className="text-xs text-neutral-400">{decliningNote}</p>
          </div>
          <span className={`text-sm font-semibold ${decliningDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatDelta(decliningDeltaPct)}
          </span>
        </div>
      </section>
    </div>
  );
}
