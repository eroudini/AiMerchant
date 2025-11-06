import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";

const suggestSchema = z.object({
  body: z.object({
    buyPrice: z.number(),
    fees: z.number(),
    competitorPrice: z.number(),
    marginMin: z.number().default(0.15),
    marginMax: z.number().default(0.25)
  })
});

function suggestPrice(buyPrice: number, fees: number, competitorPrice: number, marginMin: number, marginMax: number) {
  const target = (marginMin + marginMax) / 2;
  const candidate = (buyPrice + fees) / (1 - target);
  const low = competitorPrice * 0.95;
  const high = competitorPrice * 1.05;
  const clamped = Math.min(Math.max(candidate, low), high);
  return Math.round(clamped * 100) / 100;
}

const router = Router();

router.post("/suggest", validate(suggestSchema), (req, res) => {
  const { buyPrice, fees, competitorPrice, marginMin, marginMax } = req.body;
  const price = suggestPrice(buyPrice, fees, competitorPrice, marginMin, marginMax);
  res.json({ suggestedPrice: price });
});

export default router;
