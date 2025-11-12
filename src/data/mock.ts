// Types et données mock pour dashboard IA
export type Product = { sku: string; title: string; buy: number; price: number; fees: number; stock: number; avgDailySales: number; compPrice: number };
export type Sale = { sku: string; date: string; qty: number; revenue: number };
export type Alert = { type: "LOW_STOCK" | "LOW_MARGIN"; message: string; at: string };

export const products: Product[] = [
  { sku: "FR-USB-C-01", title: "Câble USB-C 1m", buy: 2.4, price: 8.99, fees: 2.1, stock: 120, avgDailySales: 8, compPrice: 9.45 },
  { sku: "FR-PB-10K",   title: "Powerbank 10k", buy: 9.8, price: 22.90, fees: 4.3, stock: 35,  avgDailySales: 7, compPrice: 22.70 },
  { sku: "FR-CHG-20W",  title: "Chargeur 20W",  buy: 6.1, price: 14.90, fees: 2.8, stock: 80,  avgDailySales: 6, compPrice: 15.20 },
];

// Génère des ventes sur 30 jours avec quantités réalistes
function genSales(): Sale[] {
  const out: Sale[] = [];
  const today = Date.now();
  for (const p of products) {
    for (let i = 1; i <= 10; i++) { // 10 entrées par produit
      const date = new Date(today - i * 86400000).toISOString();
      const qty = Math.max(1, Math.round(p.avgDailySales * (0.6 + Math.random() * 0.8)));
      const revenue = qty * p.price;
      out.push({ sku: p.sku, date, qty, revenue });
    }
  }
  return out;
}
export const sales30d: Sale[] = genSales();

export const alerts: Alert[] = [
  { type: "LOW_STOCK",  message: "FR-PB-10K < 10 en stock",       at: "2025-11-08T10:12:00Z" },
  { type: "LOW_MARGIN", message: "FR-CHG-20W marge < 10%",         at: "2025-11-07T08:21:00Z" },
];

export const aiTips: string[] = [
  "Augmenter légèrement le prix du câble USB-C (concurrence 9,45 € → 9,39 € suggérés).",
  "Prévoir un réassort Powerbank (rupture estimée sous 5 jours).",
  "Optimiser la fiche FR-CHG-20W : ajouter mots-clés 'charge rapide', 'voyage'.",
];
