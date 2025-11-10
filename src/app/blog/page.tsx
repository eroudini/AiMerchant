import React from "react";
import Navbar from "@/components/marketing/Navbar";
import Image from "next/image";

export default function BlogPage() {
  const posts = [
    { title: "Optimiser sa marge sans tuer la conversion", excerpt: "Cadrez vos ajustements de prix avec des fourchettes d'élasticité réalistes." },
    { title: "Prévenir les ruptures: méthode pratique", excerpt: "Indicateurs à surveiller et seuils critiques sur 7 à 30 jours." },
    { title: "Structurer ses données catalogue pour l'IA", excerpt: "Les champs essentiels (SKU, catégorie, saisonnalité, coût) et comment les nettoyer." },
  ];

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-semibold mb-4">Blog</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Conseils concrets pour piloter votre e‑commerce à l’ère de l’IA: visibilité, analyse, actions et résultats.
          </p>
        </section>

        {/* Filtres */}
        <section className="flex flex-wrap items-center gap-3 justify-between border rounded-xl p-3 bg-white mb-8">
          <div className="text-sm text-gray-600">Filtrer par</div>
          <div className="flex items-center gap-3">
            <select className="text-sm border rounded-lg px-3 py-2 bg-white">
              <option>Catégorie</option>
              <option>Pricing</option>
              <option>Ruptures / Stock</option>
              <option>Données & IA</option>
            </select>
            <select className="text-sm border rounded-lg px-3 py-2 bg-white">
              <option>Auteur</option>
              <option>Equipe AiMerchant</option>
            </select>
          </div>
        </section>

        {/* Article mis en avant */}
        <section className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Article mis en avant avec image cover */}
          <article className="group rounded-2xl border bg-white overflow-hidden flex flex-col">
            <div className="relative h-56 w-full">
              <Image
                src="/blog/cover-pricing.svg"
                alt="Illustration pricing dynamique"
                fill
                className="object-cover hover:scale-[1.02] transition-transform duration-300"
                sizes="(max-width:768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-3 text-[10px] font-medium tracking-wide text-white/90 bg-black/30 backdrop-blur px-2 py-1 rounded">Pricing</span>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h2 className="text-xl font-semibold mb-2 group-hover:text-[#FF6A00] transition-colors">Optimiser sa marge sans tuer la conversion</h2>
              <p className="text-sm text-gray-600 flex-1">Cadrez vos ajustements de prix avec des fourchettes d'élasticité réalistes.</p>
              <a href="#" className="mt-6 text-xs font-medium text-[#FF6A00] hover:underline">Lire l'article →</a>
            </div>
          </article>
          {/* Liste latérale */}
          <div className="grid gap-6">
            {posts.slice(1).map((p, i) => (
              <article key={p.title} className="group rounded-2xl border bg-white overflow-hidden flex">
                <div className="relative w-32 h-32 shrink-0">
                  <Image
                    src={i === 0 ? "/blog/thumb-stock.svg" : "/blog/thumb-data.svg"}
                    alt={p.title}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                <div className="p-4 flex flex-col">
                  <h3 className="text-base font-medium mb-1 group-hover:text-[#FF6A00] transition-colors">{p.title}</h3>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{p.excerpt}</p>
                  <a href="#" className="text-[11px] font-medium text-[#FF6A00] hover:underline">Lire</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Grille d'articles */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            ...posts,
            { title: "Rédiger des fiches produit avec l’IA", excerpt: "Prompts et structure pour générer des descriptions qui convertissent." },
            { title: "Comment prioriser ses actions chaque semaine", excerpt: "De la donnée brute à une to‑do ROI: réassort, prix, SEO." },
            { title: "KPI e‑commerce à suivre", excerpt: "Marge, rotation, taux de rupture, et comment les améliorer." },
          ].map((p, idx) => (
            <article key={p.title} className="group border rounded-xl bg-white overflow-hidden flex flex-col">
              <div className="relative h-40 w-full">
                <Image
                  src={idx % 2 === 0 ? "/blog/card-1.svg" : "/blog/cover-pricing.svg"}
                  alt={p.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-medium tracking-wide text-white/90 bg-black/30 backdrop-blur px-2 py-1 rounded">Article</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-medium mb-2 group-hover:text-[#FF6A00] transition-colors">{p.title}</h3>
                <p className="text-sm text-gray-600 mb-3 flex-1 line-clamp-3">{p.excerpt}</p>
                <a href="#" className="text-xs font-medium text-[#FF6A00] hover:underline">Lire l'article →</a>
              </div>
            </article>
          ))}
        </section>

        {/* Newsletter */}
        <section className="mt-16 rounded-2xl border bg-white p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Recevez les meilleurs conseils IA & e‑commerce</h3>
            <p className="text-sm text-gray-600">1 email / semaine, des actions concrètes. Pas de spam.</p>
          </div>
          <form className="flex w-full md:w-auto gap-2">
            <input type="email" required placeholder="Votre email" className="flex-1 md:w-72 border rounded-lg px-3 py-2 text-sm" />
            <button type="submit" className="rounded-lg bg-[#FF6A00] text-white text-sm font-medium px-4 py-2 hover:bg-[#e45f00]">
              S’abonner
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
