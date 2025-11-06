import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";

const schema = z.object({ body: z.object({ stock: z.number(), avgDailySales: z.number() }) });

function forecastDaysUntilOOS(stock: number, avgDailySales: number) {
  if (avgDailySales <= 0) return Infinity;
  return Math.ceil(stock / avgDailySales);
}

const router = Router();

router.post("/stockout", validate(schema), (req, res) => {
  const { stock, avgDailySales } = req.body;
  const days = forecastDaysUntilOOS(stock, avgDailySales);
  res.json({ days });
});

export default router;
