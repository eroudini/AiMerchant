import { products as mockProducts } from "@/data/mock";
import { Product } from "@/data/mock";
import { calcMarginPct, daysUntilOOS, suggestPrice } from "@/lib/metrics";

export type ChatMessage = { role: "user" | "assistant"; content: string };

// Heuristiques simples pour générer des conseils à partir du catalogue
export function generateAdvice(prompt: string, products: Product[] = mockProducts): string[] {
  const p = prompt.toLowerCase();
  const tips: string[] = [];

  const lowStock = products
    .map((pr) => ({ pr, days: daysUntilOOS(pr.stock, pr.avgDailySales) }))
    .filter((x) => Number.isFinite(x.days) && (x.days as number) <= 7)
    .sort((a, b) => (a.days as number) - (b.days as number))
    .slice(0, 3);

  const lowMargin = products
    .map((pr) => ({ pr, margin: calcMarginPct(pr.price, pr.buy, pr.fees) }))
    .filter((x) => x.margin < 15)
    .slice(0, 3);

  const priceIdeas = products
    .map((pr) => {
      const sugg = suggestPrice(pr.price, pr.compPrice, pr.buy, pr.fees);
      const delta = Math.round((sugg - pr.price) * 100) / 100;
      return { pr, sugg, delta };
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3);

  if (p.includes("réassort") || p.includes("stock") || p.includes("rupture")) {
    if (lowStock.length === 0) tips.push("Aucune alerte stock critique sur 7 jours d'écoulement.");
    for (const { pr, days } of lowStock) {
      const advise = Math.max(0, Math.ceil(pr.avgDailySales * 7) - pr.stock);
      tips.push(`${pr.sku}: rupture estimée ${Number.isFinite(days) ? `${days} j` : "∞"} → prévoir +${advise} u.`);
    }
  } else if (p.includes("prix") || p.includes("pricing") || p.includes("concurrence")) {
    for (const { pr, sugg } of priceIdeas) {
      const m = calcMarginPct(sugg, pr.buy, pr.fees);
      tips.push(`${pr.sku}: prix conc. ${pr.compPrice.toFixed(2)} €, suggéré ${sugg.toFixed(2)} € (marge ~${m}%).`);
    }
  } else if (p.includes("marge")) {
    for (const { pr, margin } of lowMargin) {
      tips.push(`${pr.sku}: marge faible (${margin}%) → revoir prix/frais ou coût d'achat.`);
    }
  } else if (p.includes("seo") || p.includes("fiche")) {
    for (const pr of products.slice(0, 3)) {
      tips.push(`${pr.sku}: ajouter mots-clés ‘${pr.title.split(" ")[0]}’, ‘charge rapide’, ‘garantie 2 ans’.`);
    }
  } else {
    // Suggestions par défaut type product designer
    tips.push("Réassort: ciblez 7 jours d'écoulement. Priorité aux références avec rupture < 5 jours.");
    if (lowStock[0]) tips.push(`Ex: ${lowStock[0].pr.sku} sous ${(lowStock[0].days as number)} j.`);
    if (priceIdeas[0]) tips.push(`Pricing: ${priceIdeas[0].pr.sku} → ${priceIdeas[0].sugg.toFixed(2)} € (±5% conc.).`);
    if (lowMargin[0]) tips.push(`Marge: ${lowMargin[0].pr.sku} sous 15%, envisager hausse légère.`);
  }

  return tips;
}
