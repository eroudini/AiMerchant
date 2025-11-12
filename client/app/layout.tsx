import "@/app/globals.css";

export const metadata = {
  title: "AiMerchant",
  description: "Plateforme de gestion de commerce intelligent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
  return (
    <html lang="fr">
      <body className="min-h-screen bg-black text-white">
        <div className="grid grid-cols-[220px_1fr] min-h-screen">
          {/* Sidebar */}
          <aside className="border-r border-white/10 bg-neutral-950/60 backdrop-blur">
            <div className="px-4 py-4 border-b border-white/10">
              <div className="text-sm tracking-wide text-neutral-300">AIMerchant</div>
              <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">IA activée</div>
            </div>
            <nav className="px-3 py-3 space-y-1">
              <a href="/app/dashboard" className="block rounded-md px-3 py-2 text-sm hover:bg-white/5">Dashboard</a>
              <a href="/app/copilot" className="block rounded-md px-3 py-2 text-sm hover:bg-white/5">AiChat</a>
            </nav>
            <div className="px-3 pt-4 pb-3 border-t border-white/10">
              <div className="mb-2 text-[11px] uppercase tracking-wide text-neutral-400">Accès rapide BFF</div>
              <div className="space-y-2">
                <a target="_blank" rel="noreferrer" href={`${API_BASE}/bff/kpi/overview?period=last_7d`} className="block rounded-md border border-white/10 bg-black/40 px-3 py-2 text-[12px] hover:border-amber-500/30">KPIs 7j</a>
                <a target="_blank" rel="noreferrer" href={`${API_BASE}/bff/competitors/diff?period=last_7d`} className="block rounded-md border border-white/10 bg-black/40 px-3 py-2 text-[12px] hover:border-amber-500/30">Concurrence 7j</a>
                <a target="_blank" rel="noreferrer" href={`${API_BASE}/bff/market/heatmap?period=last_7d`} className="block rounded-md border border-white/10 bg-black/40 px-3 py-2 text-[12px] hover:border-amber-500/30">Heatmap marché</a>
                <a target="_blank" rel="noreferrer" href={`${API_BASE}/bff/alerts/movements?period=last_7d`} className="block rounded-md border border-white/10 bg-black/40 px-3 py-2 text-[12px] hover:border-amber-500/30">Alertes 7j</a>
                <a target="_blank" rel="noreferrer" href={`${API_BASE}/bff/radar/trends?period=last_30d&type=product`} className="block rounded-md border border-white/10 bg-black/40 px-3 py-2 text-[12px] hover:border-amber-500/30">Radar produits 30j</a>
                <a target="_blank" rel="noreferrer" href={`${API_BASE}/bff/export/csv?resource=market_heatmap&period=last_7d`} className="block rounded-md border border-white/10 bg-black/40 px-3 py-2 text-[12px] hover:border-amber-500/30">Export CSV heatmap</a>
                <a target="_blank" rel="noreferrer" href={`${API_BASE}/bff/pricing/simulate?sku=DEMO&delta=5`} className="block rounded-md border border-white/10 bg-black/40 px-3 py-2 text-[12px] hover:border-amber-500/30">Pricing simulate</a>
                <a target="_blank" rel="noreferrer" href={`${API_BASE}/bff/pricing/suggest?sku=DEMO&buy=10&fees=2&target=0.2&clamp=0.05`} className="block rounded-md border border-white/10 bg-black/40 px-3 py-2 text-[12px] hover:border-amber-500/30">Pricing suggest</a>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="overflow-x-hidden">{children}</main>
        </div>
      </body>
    </html>
  );
}