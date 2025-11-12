import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import Navbar from "@/components/marketing/Navbar";

export default function PricingPage() {
  const plans = [
    { name: "Starter", price: "19€", blurb: "Pour démarrer.", features: ["500 produits", "Rapports de base", "1 utilisateur", "Support email"], cta: "Commencer", popular: false },
    { name: "Pro", price: "59€", blurb: "Le plus populaire.", features: ["5 000 produits", "Rapports avancés", "3 utilisateurs", "Alertes IA", "Support prioritaire"], cta: "Choisir Pro", popular: true },
    { name: "Enterprise", price: "Sur devis", blurb: "À grande échelle.", features: ["Illimité", "SLA", "SSO/SAML", "Intégrations", "CSM dédié"], cta: "Parler à un expert", popular: false }
  ] as const;

  return (
    <>
  <Navbar />
  <main className="min-h-screen w-full text-white bg-gradient-to-b from-[#0B0B10] via-[#0A0A0F] to-black">
    <div className="px-6 sm:px-8 lg:px-12 pt-20 pb-16 max-w-7xl mx-auto">
    <div className="text-center mb-14">
        <h1 className="text-4xl font-semibold mb-4">Tarifs simples et transparents</h1>
        <p className="text-neutral-400 text-sm max-w-2xl mx-auto">
          Commencez gratuitement pour valider la valeur. Passez au plan Pro pour l'optimisation automatique des prix,
          la prévision stock avancée, les scénarios marge et un copilote IA connecté à vos données.
        </p>
      </div>
  <div className="grid md:grid-cols-3 gap-8" role="list" aria-label="Plans tarifaires">
        {plans.map((plan) => {
          const isPro = plan.popular;
          const isEnterprise = plan.name === "Enterprise";
          return (
            <div
              key={plan.name}
              role="listitem"
              data-popular={isPro ? "true" : undefined}
              className={[
                "relative border rounded-2xl p-8 bg-white/5 text-white flex flex-col overflow-visible",
                "border-white/10",
                isPro ? "ring-2 ring-[#FF6A00] shadow-lg" : "shadow-sm",
              ].join(" ")}
            >
              {isPro && (
                <span
                  role="status"
                  className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 z-20 select-none rounded-full border border-white/20 bg-black/80 px-3 py-1 text-xs text-white shadow"
                >
                  ⭐ Le plus populaire ⭐
                </span>
              )}

              <h2 className="text-xl font-medium mb-1">{plan.name}</h2>
              <p className="text-xs text-neutral-400 mb-5">{plan.blurb}</p>
              <div className="text-4xl font-semibold mb-6">
                {plan.price}
                {plan.price !== "Sur devis" && (
                  <span className="text-base font-normal"> / mois</span>
                )}
              </div>

              <ul className="text-sm space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check aria-hidden="true" className="w-4 h-4 mt-0.5 text-orange-400" />
                    <span className="text-neutral-300">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={isEnterprise ? "/contact" : "/register"}
                aria-label={`${plan.cta} - Plan ${plan.name}`}
                className={[
                  "mt-auto inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 transition-colors",
                  isPro
                    ? "bg-[#FF6A00] text-white hover:bg-[#e45f00]"
                    : "border border-white/20 text-white/90 hover:bg-white/10",
                ].join(" ")}
              >
                {plan.cta}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Comparatif */}
      <div className="mt-20">
        <h3 className="text-lg font-semibold mb-6">Comparatif rapide</h3>
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="bg-white/10 text-neutral-300">
              <tr>
                <th className="text-left font-medium px-4 py-3">Fonction</th>
                <th className="text-left font-medium px-4 py-3">Starter</th>
                <th className="text-left font-medium px-4 py-3">Pro</th>
                <th className="text-left font-medium px-4 py-3">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Produits inclus", "500", "5 000", "Illimité"],
                ["Rapports", "De base", "Avancés", "Avancés"],
                ["Utilisateurs", "1", "3", "Illimité"],
                ["Alertes IA", "—", "✔", "✔"],
                ["Support", "Email", "Prioritaire", "SLA + CSM"],
                ["SSO/SAML", "—", "—", "✔"],
                ["Intégrations/API", "Limité", "Complet", "Complet"],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-white/10">
                  <td className="px-4 py-3 font-medium text-neutral-300">{row[0]}</td>
                  <td className="px-4 py-3 text-neutral-400">{row[1]}</td>
                  <td className="px-4 py-3 text-white">{row[2]}</td>
                  <td className="px-4 py-3 text-white">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-24 text-center">
        <h3 className="text-2xl font-semibold mb-4">Prêt à automatiser vos décisions ?</h3>
        <p className="text-sm text-neutral-400 mb-6">Créez votre compte en moins de 2 minutes et commencez à explorer vos opportunités.</p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-full bg-[#FF6A00] text-white text-sm font-medium px-8 py-3 hover:bg-[#e45f00] transition-colors"
        >
          Je démarre maintenant
        </Link>
      </div>
      </div>
    </main>
    </>
  );
}
