import KPIGrid from "@/components/dashboard/KPIGrid";
import SalesChart from "@/components/dashboard/SalesChart";
import QuickActions from "@/components/dashboard/QuickActions";
import AiChat from "@/components/sections/AiChat";
import AIInsightsSection from "@/components/sections/AIInsights";
import Forecast from "@/components/sections/Forecast";
import TopProducts from "@/components/sections/TopProducts";
import AlertsListSection from "@/components/sections/AlertsList";
import PricingSuggestions from "@/components/sections/PricingSuggestions";
import { Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 relative theme-dark">
      {/* Fond décor sombre + halo subtil */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#111] via-neutral-900 to-neutral-950" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(800px_600px_at_75%_20%,rgba(255,106,0,0.22),transparent)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* En‑tête dashboard */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
            <Sparkles className="w-3 h-3" /> IA Retail
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-neutral-400 max-w-xl leading-relaxed">Vue synthétique: performance, alertes, prévisions et recommandations IA. Agissez rapidement sur le pricing, le réassort et la marge.</p>
        </header>

        {/* KPIs principaux */}
        <section className="space-y-6">
          <KPIGrid />
        </section>

        {/* Grille principale */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AiChat />
            <AIInsightsSection />
            <Forecast />
            <TopProducts />
          </div>
          <div className="space-y-6">
            <PricingSuggestions />
            <AlertsListSection />
            <SalesChart />
            <QuickActions />
          </div>
        </section>
      </div>
    </main>
  );
}
