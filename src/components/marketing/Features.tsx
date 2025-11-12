"use client";
import { motion } from "framer-motion";
import { Bot, Sparkles, TrendingUp, Shield } from "lucide-react";

const features = [
  { icon: Bot, title: "AI Insights", text: "Analyse contextuelle pour guider vos décisions." },
  { icon: Sparkles, title: "Copilot texte", text: "Générez des descriptions et messages optimisés." },
  { icon: TrendingUp, title: "Pricing Engine", text: "Moteur d'ajustement dynamique des prix." },
  { icon: Shield, title: "Forecast Rupture", text: "Anticipez les ruptures pour sécuriser le chiffre d'affaires." },
];

export function Features() {
  return (
    <section className="container-responsive py-20" aria-labelledby="features-heading">
      <div className="max-w-3xl mb-10">
        <h2 id="features-heading" className="text-3xl font-bold tracking-tight">Fonctionnalités détaillées</h2>
        <p className="text-gray-600 mt-4">Des capacités avancées orchestrées par l'IA pour maximiser chaque euro de marge.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="card p-6 flex flex-col gap-3"
            >
              <div className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.text}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
