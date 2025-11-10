import React from "react";

export default function BlogPage() {
  const posts = [
    { title: "Optimiser sa marge sans tuer la conversion", excerpt: "Cadrez vos ajustements de prix avec des fourchettes d'élasticité réalistes." },
    { title: "Prévenir les ruptures: méthode pratique", excerpt: "Indicateurs à surveiller et seuils critiques sur 7 à 30 jours." },
    { title: "Structurer ses données catalogue pour l'IA", excerpt: "Les champs essentiels (SKU, catégorie, saisonnalité, coût) et comment les nettoyer." },
  ];

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold mb-6">Articles e‑commerce & optimisation</h1>
      <p className="text-gray-600 mb-10 text-sm leading-relaxed">
        Ressources pour améliorer votre pilotage: réassort, pricing dynamique, structuration des données
        et gains de marge. Nouveaux articles chaque semaine.
      </p>
      <div className="space-y-6">
        {posts.map((p) => (
          <article key={p.title} className="border rounded-xl p-5 bg-white hover:shadow-sm transition-shadow">
            <h2 className="text-lg font-medium mb-2">{p.title}</h2>
            <p className="text-sm text-gray-600 mb-3">{p.excerpt}</p>
            <a href="#" className="text-xs font-medium text-[#FF6A00] hover:underline">
              Lire l'article →
            </a>
          </article>
        ))}
      </div>
    </main>
  );
}
