import React from "react";
import { Sparkles, BarChart3, LineChart, AlertTriangle, MessageSquare, TrendingUp, PlugZap, Database, ListChecks } from "lucide-react";
import OrbVisual from "@/components/visual/OrbVisual";
import Navbar from "@/components/marketing/Navbar";
import CtaLink from "@/components/marketing/CtaLinks";

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
    <main className="min-h-screen flex flex-col">
      {/* Navbar (même placement que page pricing) */}
      <Navbar />
      {/* Hero split avec orbe visuel */}
      <section className="relative overflow-hidden py-20 md:py-24 px-6 sm:px-8 lg:px-12 bg-gradient-to-b from-[#F7F7F5] via-white to-[#FFF2E9]">
        {/* Fond image fourni */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-center bg-cover opacity-80 origin-center motion-safe:animate-[spin_60s_linear_infinite]"
          style={{ backgroundImage: "url('/hero/banniere.png')" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
              <Sparkles className="w-3 h-3" /> IA appliquée au retail
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#121212]">
              Dominez votre marché e‑commerce avec l’IA
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              AiMerchant analyse votre catalogue, la vitesse de vente et la concurrence pour prioriser
              réassort, ajustements de prix et optimisations produit — sans tableur.
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
                className="px-6 py-3 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50"
              >
                Commencer
              </CtaLink>
            </div>
            <div className="flex gap-8 pt-2 opacity-70">
              {["NovaShop","Electro+","Maison&Co","Batterix","CablePro"].map((l) => (
                <div key={l} className="text-sm font-semibold text-gray-400">{l}</div>
              ))}
            </div>
          </div>
          <OrbVisual />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FF6A00] to-transparent opacity-60" />
      </section>

        {/* (Section pricing déplacée sur /pricing) */}
      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">Tout ce qu'il faut pour piloter votre catalogue</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card p-5 border rounded-xl bg-white flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-medium">{f.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
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
                <div key={h.title} className="card p-6 rounded-xl border bg-white flex flex-col gap-3">
                  <Icon className="w-5 h-5 text-indigo-600" />
                  <div className="font-medium">{h.title}</div>
                  <p className="text-sm text-gray-600">{h.desc}</p>
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
            <div key={s.label} className="card p-6 rounded-xl border flex flex-col items-center text-center gap-2">
              <div className="text-3xl font-bold text-indigo-600">{s.value}</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-white">
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
              <details key={item.q} className="group rounded-xl border bg-white p-5 open:shadow-sm transition-all">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                  <span className="font-medium text-gray-900">{item.q}</span>
                  <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs text-gray-500 group-open:hidden">+</span>
                  <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs text-gray-500 hidden group-open:inline">–</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignage */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-indigo-50">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <blockquote className="text-lg text-gray-700 leading-relaxed">
            « Avant AiMerchant nous passions des heures à estimer nos besoins de stock. Maintenant les alertes
            réassort et les suggestions de prix sont intégrées à notre routine quotidienne. »
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-200" />
            <div className="text-sm text-gray-600 text-left">
              <div className="font-medium">Claire D.</div>
              <div>Responsable e-commerce</div>
            </div>
          </div>
        </div>
      </section>

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
