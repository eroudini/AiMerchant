"use client";
import { motion } from "framer-motion";
import { BarChart3, Bot, Bell, TrendingUp } from "lucide-react";

const props = [
  { icon: BarChart3, title: "Tableau de bord intuitif", text: "CA, marges et top produits en un coup d'œil." },
  { icon: Bot, title: "Recommandations IA", text: "Synthèses actionnables basées sur vos données." },
  { icon: Bell, title: "Alertes intelligentes", text: "Baisse des ventes, marge faible, anomalies détectées." },
  { icon: TrendingUp, title: "Pricing & Benchmarks", text: "Ajustements de prix suggérés et comparatifs marché." },
];

export function ValueProps() {
  return (
    <section className="container-responsive py-16" aria-labelledby="value-props-heading">
      <h2 id="value-props-heading" className="sr-only">Valeurs clés</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {props.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="card p-5 flex flex-col gap-3"
            >
              <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="font-semibold text-sm">{p.title}</h3>
              <p className="text-sm text-gray-600">{p.text}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
