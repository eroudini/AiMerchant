// Helpers métriques (frontend only)

export function calcMarginPct(unitPrice: number, buy: number, fees: number): number {
  if (!isFinite(unitPrice) || unitPrice <= 0) return 0;
  const margin = unitPrice - buy - fees;
  const pct = (margin / unitPrice) * 100;
  // Arrondir à l'entier comme attendu par les tests
  return Math.max(0, Math.round(pct));
}

// Vise ~20% de marge, borné par ±5% du prix concurrent
export function suggestPrice(
  currentPrice: number,
  compPrice: number,
  buy: number,
  fees: number,
  targetMin = 0.15,
  targetMax = 0.25
): number {
  const target = 0.2;
  const base = buy + fees;
  const ideal = base <= 0 ? currentPrice : base / (1 - target);

  // Clamp autour du prix concurrent
  const min = compPrice * 0.95;
  const max = compPrice * 1.05;
  let candidate = isFinite(ideal) && ideal > 0 ? ideal : currentPrice;

  // S'assurer de respecter la marge min et max si possible
  const priceForMin = base / (1 - targetMin);
  const priceForMax = base / (1 - targetMax);
  candidate = Math.max(candidate, priceForMin);
  candidate = Math.min(candidate, Math.max(priceForMax, candidate));

  // Clamp à ±5% du prix concurrent
  candidate = Math.min(Math.max(candidate, min), max);

  // Ne jamais vendre à perte
  candidate = Math.max(candidate, base * 1.02);

  // Arrondi 2 décimales
  return Math.round(candidate * 100) / 100;
}

export function daysUntilOOS(stock: number, avgDaily: number): number {
  if (!isFinite(stock) || !isFinite(avgDaily) || avgDaily <= 0) return Infinity;
  const days = stock / avgDaily;
  // On préfère arrondir à l'entier supérieur pour rester conservateur
  return Math.ceil(days);
}
