import React from "react";
import { Sparkles, BarChart3, LineChart, AlertTriangle, MessageSquare, TrendingUp, PlugZap, Database, ListChecks } from "lucide-react";
import OrbVisual from "@/components/visual/OrbVisual";
import Navbar from "@/components/marketing/Navbar";
import CtaLink from "@/components/marketing/CtaLinks";
import Testimonial from "@/components/marketing/Testimonial";

export default function Home() {
  const features = [
    { icon: BarChart3, title: "Réassort intelligent", desc: "Anticipez les ruptures et optimisez vos niveaux de stock sur 7 à 30 jours." },
    { icon: LineChart, title: "Pricing dynamique", desc: "Ajustements guidés par la concurrence et la marge cible (15–25%)." },
    { icon: TrendingUp, title: "Optimisation marge", desc: "Détecte produits sous-performants et propose hausses stratégiques." },
    { icon: MessageSquare, title: "Copilot conversationnel", desc: "Posez vos questions métier et recevez des conseils exploitables immédiatement." },
    { icon: Sparkles, title: "Insights actionnables", desc: "Actions priorisées: réassort, prix, SEO fiches produit." },
    { icon: AlertTriangle, title: "Alertes en temps réel", desc: "Stock bas, marge faible, anomalies de vente." },
  ];

  const stats = [
    { label: "Marge moyenne", value: "+12%" },
    { label: "Ruptures évitées", value: "-30%" },
    { label: "Temps analyse", value: "÷4" },
  ];

  const how = [
    { icon: PlugZap, title: "Connectez", desc: "Brancher vos marketplaces & CMS (CSV possible)." },
    { icon: Database, title: "Synchronisez", desc: "Catalogue et ventes analysés automatiquement." },
    { icon: ListChecks, title: "Agissez", desc: "Actions IA priorisées: réassort, prix, SEO." },
  ];

  return (
    <main className="min-h-screen flex flex-col pt-16 bg-gradient-to-b from-[#0B0B10] via-[#0A0A0F] to-black text-white">
      {/* Navbar (même placement que page pricing) */}
      <Navbar />
      {/* Hero split avec orbe visuel */}
  <section className="relative overflow-hidden pt-12 md:pt-16 pb-16 md:pb-20 px-6 sm:px-8 lg:px-12">
        {/* Fond image fourni */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-center bg-cover opacity-15 origin-center motion-safe:animate-[spin_60s_linear_infinite]"
          style={{ backgroundImage: "url('/hero/banniere.png')" }}
        />
  <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
              <Sparkles className="w-3 h-3" /> IA appliquée au retail
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              Dominez votre marché e‑commerce avec l’IA
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              L’IA qui priorise réassort, prix et actions catalogue pour plus de marge — sans Excel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <CtaLink
                href="/login"
                location="hero"
                eventLabel="Demander une démo"
                className="px-6 py-3 rounded-full bg-[#FF6A00] text-white text-sm font-medium shadow hover:bg-[#e35d00]"
              >
                Demander une démo
              </CtaLink>
              <CtaLink
                href="/register"
                location="hero"
                eventLabel="Commencer"
                className="px-6 py-3 rounded-full border border-white/20 text-white/90 text-sm font-medium hover:bg-white/10"
              >
                Commencer
              </CtaLink>
            </div>
            {/* Preuve sociale alternative (sans prétendre des clients) */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-sm text-neutral-400">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10">Bêta ouverte</span>
              <span className="text-neutral-600">•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10">14 jours d’essai — sans CB</span>
              <span className="text-neutral-600">•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10">Hébergement UE — RGPD</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[13px] text-neutral-400">
              <span className="opacity-80">Fonctionne avec</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">Shopify</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">Amazon</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">WooCommerce</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">CSV</span>
            </div>
          </div>
          <OrbVisual />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FF6A00]/30 to-transparent opacity-60" />
      </section>

        {/* (Section pricing déplacée sur /pricing) */}
      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">Tout ce qu'il faut pour piloter votre catalogue</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card p-5 border border-white/10 rounded-xl bg-white/5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-orange-400" />
                    <h3 className="font-medium">{f.title}</h3>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">Comment ça marche</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {how.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.title} className="card p-6 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-3">
                  <Icon className="w-5 h-5 text-orange-400" />
                  <div className="font-medium">{h.title}</div>
                  <p className="text-sm text-neutral-400">{h.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="card p-6 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center text-center gap-2">
              <div className="text-3xl font-bold text-orange-400">{s.value}</div>
              <div className="text-xs uppercase tracking-wide text-neutral-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">Questions fréquentes</h2>
          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            {[
              {
                q: "Nos produits sont souvent en rupture ou sur‑stockés. Comment vous aidez ?",
                a: "AiMerchant prédit la demande sur 7 à 30 jours et classe vos articles par risque de rupture ou sur‑stock. Vous recevez une to‑do priorisée de réassort avec quantités proposées et dates cibles, plus des alertes proactives pour éviter les pertes de ventes.",
              },
              {
                q: "Notre marge s’érode face à la concurrence. Que proposez‑vous ?",
                a: "Un moteur de pricing qui surveille les concurrents et suggère des prix respectant votre marge cible (ex. 15–25%). Les recommandations sont plafonnées/planche selon vos règles et accompagnées d’un impact estimé sur CA et marge.",
              },
              {
                q: "On passe des heures dans Excel sans savoir quoi prioriser. Quelle est l’alternative ?",
                a: "Connexion à vos canaux (CSV, Shopify, WooCommerce, marketplaces), consolidation automatique, puis une liste d’actions prêtes à appliquer : réassort, ajustements de prix, SEO fiches produit. Fini le tri manuel, place à l’exécution.",
              },
              {
                q: "Quels produits attaquer en premier pour un gain rapide ?",
                a: "Le scoring d’opportunité identifie les quick wins : best‑sellers en tension, articles sous‑tarifés, marges faibles à corriger. Vous voyez l’impact potentiel et le niveau d’effort avant d’agir.",
              },
              {
                q: "Nos données sont incomplètes/\"sales\". Est‑ce bloquant ?",
                a: "Non. Nous acceptons le CSV et harmonisons les champs (SKU, catégories, prix, stocks). Un contrôle d’anomalies (prix nuls, stocks négatifs, références orphelines) sécurise vos décisions.",
              },
              {
                q: "En combien de temps voit‑on un résultat ?",
                a: "Mise en route en 48h pour une première analyse. La majorité des clients observent des gains mesurables en 2–4 semaines (hausse de marge moyenne, moins de ruptures, temps d’analyse ÷4).",
              },
              {
                q: "Sécurité et conformité ?",
                a: "Chiffrement en transit et au repos, gestion des rôles, accès journalisés. Hébergement UE et respect des bonnes pratiques RGPD. Vos données restent votre propriété.",
              },
              {
                q: "Quel ROI puis‑je attendre ?",
                a: "Dépend du catalogue et des volumes, mais les cas d’usage typiques combinent +10–15% de marge moyenne et −30% de ruptures évitées. Un essai de 14 jours permet d’estimer votre ROI sur vos propres données.",
              },
            ].map((item) => (
              <details key={item.q} className="group rounded-xl border border-white/10 bg-white/5 p-5 open:shadow-sm transition-all">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                  <span className="font-medium text-white">{item.q}</span>
                  <span className="shrink-0 rounded-full border border-white/20 px-2 py-0.5 text-xs text-neutral-400 group-open:hidden">+</span>
                  <span className="shrink-0 rounded-full border border-white/20 px-2 py-0.5 text-xs text-neutral-400 hidden group-open:inline">–</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignage animé */}
  <Testimonial />

      {/* CTA finale */}
      <section id="cta" className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-indigo-600 text-white rounded-2xl p-12 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Passez à un pilotage pro en quelques minutes</h2>
            <p className="text-sm text-indigo-100">Importez votre catalogue et laissez l'IA prioriser vos actions à ROI rapide.</p>
          </div>
          <CtaLink
            href="/register"
            location="final_cta"
            eventLabel="Essayer maintenant"
            className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-medium text-sm shadow hover:bg-indigo-50"
          >
            Essayer maintenant
          </CtaLink>
        </div>
      </section>
    </main>
  );
}
