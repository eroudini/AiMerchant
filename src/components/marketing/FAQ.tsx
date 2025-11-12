"use client";
import { motion } from "framer-motion";

const faqs = [
  { q: "Comment fonctionne AIMerchant ?", a: "Nous analysons vos données de ventes pour générer des recommandations IA." },
  { q: "Puis-je annuler à tout moment ?", a: "Oui, l'abonnement est sans engagement et résiliable en 1 clic." },
  { q: "Mes données sont-elles sécurisées ?", a: "Stockage chiffré, conformité RGPD et accès restreint." },
  { q: "Proposez-vous un essai gratuit ?", a: "Oui, vous pouvez tester la plateforme avant de choisir un plan." },
  { q: "Quelle est la différence entre Starter et Pro ?", a: "Le plan Pro débloque des volumes plus élevés et des modules avancés (Pricing Engine)." },
  { q: "Support disponible ?", a: "Email pour Starter, support prioritaire pour Pro." },
];

export function FAQ() {
  return (
    <section className="container-responsive py-20" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-3xl font-bold tracking-tight mb-10">FAQ</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {faqs.map((f, i) => (
          <motion.div
            key={f.q}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="card p-5"
          >
            <h3 className="font-semibold text-sm mb-1">{f.q}</h3>
            <p className="text-sm text-gray-600">{f.a}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
