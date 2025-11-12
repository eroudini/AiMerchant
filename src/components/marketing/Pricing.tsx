"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const tiers = [
  { name: "Starter", price: 19, features: ["Jusqu'à 1K produits", "Recommandations IA", "Alertes basiques"] },
  { name: "Pro", price: 49, features: ["Jusqu'à 10K produits", "Insights avancés", "Pricing Engine", "Support prioritaire"] },
];

export function Pricing() {
  return (
    <section className="container-responsive py-20" aria-labelledby="pricing-heading">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 id="pricing-heading" className="text-3xl font-bold tracking-tight">Tarifs simples et transparents</h2>
        <p className="text-gray-600 mt-4">Essayer gratuitement — Sans engagement, annulable à tout moment.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {tiers.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="card p-6 flex flex-col"
          >
            <h3 className="text-xl font-semibold mb-2">{t.name}</h3>
            <div className="text-4xl font-bold mb-4">{t.price}€<span className="text-base font-medium text-gray-500">/mois</span></div>
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              {t.features.map((f) => <li key={f}>• {f}</li>)}
            </ul>
            <Link href="/register" className="btn-primary mt-auto">Choisir {t.name}</Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
