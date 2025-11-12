"use client";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="container-responsive pt-24 pb-16 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center justify-center gap-2 mb-4 text-[color:var(--brand)]">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AIMerchant</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
          Le copilote IA des commerçants pour doper ventes et marges
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-8">
          Analyse en temps réel, recommandations intelligentes, alertes, pricing piloté par l’IA.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/register" className="btn-primary w-full sm:w-auto">Essayer gratuitement</Link>
          <Link href="/app/dashboard" className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-50 transition w-full sm:w-auto">Voir une démo</Link>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {["RGPD-ready", "Multi-marketplaces EU", "OpenAI powered"].map((b) => (
            <span key={b} className="badge">{b}</span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
