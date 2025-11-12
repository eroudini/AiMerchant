import React from "react";
import Link from "next/link";
import Navbar from "@/components/marketing/Navbar";

export default function PricingPage() {
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
  <div className="grid md:grid-cols-2 gap-8">
        {/* Free */}
        <div className="border border-white/10 rounded-2xl p-8 bg-white/5 flex flex-col shadow-sm">
          <h2 className="text-xl font-medium mb-1">Gratuit</h2>
          <p className="text-xs text-neutral-400 mb-5">Pour découvrir et tester avant engagement.</p>
          <ul className="text-sm space-y-2 mb-8">
            <li className="flex gap-2"><span className="text-[#FF6A00]">✔</span> Dashboard basique (ventes, stock, marge)</li>
            <li className="flex gap-2"><span className="text-[#FF6A00]">✔</span> Recos réassort simples</li>
            <li className="flex gap-2"><span className="text-[#FF6A00]">✔</span> Export CSV</li>
            <li className="flex gap-2 opacity-60"><span>✖</span> Pricing dynamique</li>
            <li className="flex gap-2 opacity-60"><span>✖</span> Prévisions IA multi‑horizon</li>
            <li className="flex gap-2 opacity-60"><span>✖</span> Chat IA personnalisé</li>
            <li className="flex gap-2 opacity-60"><span>✖</span> Simulation marge / stock</li>
          </ul>
          <Link
            href="/register"
            className="mt-auto inline-flex items-center justify-center rounded-full bg-[#FF6A00] text-white text-sm font-medium px-6 py-3 hover:bg-[#e45f00] transition-colors"
          >
            Créer mon compte
          </Link>
        </div>
        {/* Pro */}
        <div className="border border-white/10 rounded-2xl p-8 bg-white/5 text-white flex flex-col relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{ background: "radial-gradient(circle at 40% 30%, #FF6A00 0%, transparent 60%)" }}
          />
          <h2 className="text-xl font-medium mb-1 relative">Pro</h2>
          <p className="text-xs text-neutral-400 mb-5 relative">Automatisations & accélération décisionnelle.</p>
          <div className="text-4xl font-semibold mb-6 relative">99€<span className="text-base font-normal"> / mois</span></div>
          <ul className="text-sm space-y-2 mb-8 relative">
            <li className="flex gap-2"><span className="text-[#FFB380]">✔</span> Tout du plan Gratuit</li>
            <li className="flex gap-2"><span className="text-[#FFB380]">✔</span> Pricing dynamique piloté par IA</li>
            <li className="flex gap-2"><span className="text-[#FFB380]">✔</span> Prévisions de demande multi‑horizon</li>
            <li className="flex gap-2"><span className="text-[#FFB380]">✔</span> Scénarios marge / stock simulés</li>
            <li className="flex gap-2"><span className="text-[#FFB380]">✔</span> Chat IA sur vos données</li>
            <li className="flex gap-2"><span className="text-[#FFB380]">✔</span> Support prioritaire</li>
            <li className="flex gap-2"><span className="text-[#FFB380]">✔</span> API & webhooks</li>
          </ul>
          <Link
            href="/register"
            className="mt-auto inline-flex items-center justify-center rounded-full bg-white text-[#FF6A00] text-sm font-medium px-6 py-3 hover:bg-gray-100 transition-colors relative"
          >
            Essayer le plan Pro
          </Link>
        </div>
      </div>

      {/* Comparatif */}
      <div className="mt-20">
        <h3 className="text-lg font-semibold mb-6">Comparatif rapide</h3>
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="bg-white/10 text-neutral-300">
              <tr>
                <th className="text-left font-medium px-4 py-3">Fonction</th>
                <th className="text-left font-medium px-4 py-3">Gratuit</th>
                <th className="text-left font-medium px-4 py-3">Pro</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Dashboard basique", "✔", "✔"],
                ["Recos réassort", "Basique", "Avancées"],
                ["Pricing dynamique", "—", "✔"],
                ["Prévision IA", "—", "✔"],
                ["Simulation marge / stock", "—", "✔"],
                ["Chat IA personnalisé", "—", "✔"],
                ["API & webhooks", "—", "✔"],
                ["Support", "Standard", "Prioritaire"],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-white/10">
                  <td className="px-4 py-3 font-medium text-neutral-300">{row[0]}</td>
                  <td className="px-4 py-3 text-neutral-400">{row[1]}</td>
                  <td className="px-4 py-3 text-white">{row[2]}</td>
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
