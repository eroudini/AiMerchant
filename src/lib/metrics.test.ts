// Tests simples (Vitest style ou console.assert fallback). Pas de framework installé -> assertions directes.
import { calcMarginPct, suggestPrice, daysUntilOOS } from "./metrics";

function approxBetween(val: number, min: number, max: number) {
  return val >= min && val <= max;
}

console.assert(calcMarginPct(10, 2.4, 2.1) === 55, "calcMarginPct doit retourner 55");
const sp = suggestPrice(8.99, 9.45, 2.4, 2.1);
console.assert(approxBetween(sp, 9.0, 9.95), `suggestPrice hors bornes: ${sp}`);
console.assert(daysUntilOOS(50, 10) === 5, "daysUntilOOS(50,10) doit être 5");
console.assert(calcMarginPct(0, 1, 1) === 0, "calcMarginPct(0,1,1) doit être 0");
console.assert(daysUntilOOS(10, 0) === Infinity, "daysUntilOOS(10,0) doit être Infinity");

// Log récap
console.log("metrics tests exécutés", { sp });
