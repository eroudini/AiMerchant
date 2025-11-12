import { generateAdvice } from "./aiChat";

// Assertions non bloquantes pour vérifier les heuristiques principales
const adv1 = generateAdvice("réassort");
console.assert(Array.isArray(adv1) && adv1.length >= 0, "adv réassort doit retourner un tableau");

const adv2 = generateAdvice("prix");
console.assert(Array.isArray(adv2) && adv2.length > 0, "adv prix doit retourner au moins une suggestion");

const adv3 = generateAdvice("marge");
console.assert(Array.isArray(adv3), "adv marge doit retourner un tableau");

console.log("aiChat tests exécutés", { c1: adv1.length, c2: adv2.length, c3: adv3.length });
