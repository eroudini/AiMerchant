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
              <a href="/forecast" className="block rounded-md px-3 py-2 text-sm hover:bg-white/5">Prévisions</a>
            </nav>
            {/* Section supprimée: Accès rapide BFF (ancienne maquette client/) */}
          </aside>

          {/* Main content */}
          <main className="overflow-x-hidden">{children}</main>
        </div>
      </body>
    </html>
  );
}