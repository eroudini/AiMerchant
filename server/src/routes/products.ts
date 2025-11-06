import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { getPrisma } from "../db.js";

let prisma: any = null;
try {
  prisma = getPrisma();
} catch {}

const memory: any[] = [];

const createSchema = z.object({
  body: z.object({
    sku: z.string().min(1),
    title: z.string().min(1),
    buyPrice: z.number(),
    fees: z.number(),
    price: z.number(),
    stock: z.number().int(),
    marketplace: z.string().min(1)
  })
});

const updateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    title: z.string().optional(),
    buyPrice: z.number().optional(),
    fees: z.number().optional(),
    price: z.number().optional(),
    stock: z.number().int().optional(),
  })
});

const router = Router();

router.use(requireAuth);

router.get("/", async (req: any, res) => {
  const userId = req.user.sub;
  const search = String(req.query.search || "").toLowerCase();
  if (prisma) {
    const items = await prisma.product.findMany({
      where: {
        userId,
        ...(search ? { title: { contains: search, mode: "insensitive" } } : {})
      }
    });
    return res.json(items);
  }
  const items = memory.filter((p) => p.userId === userId && (!search || p.title.toLowerCase().includes(search)));
  res.json(items);
});

router.post("/", validate(createSchema), async (req: any, res) => {
  const data = req.body;
  const userId = req.user.sub;
  if (prisma) {
    const created = await prisma.product.create({ data: { ...data, userId } });
    return res.status(201).json(created);
  }
  const created = { id: String(memory.length + 1), userId, ...data };
  memory.push(created);
  res.status(201).json(created);
});

router.patch("/:id", validate(updateSchema), async (req: any, res) => {
  const { id } = req.params;
  const data = req.body;
  const userId = req.user.sub;
  if (prisma) {
    const product = await prisma.product.findFirst({ where: { id, userId } });
    if (!product) return res.status(404).json({ error: "Not found" });
    const updated = await prisma.product.update({ where: { id }, data });
    return res.json(updated);
  }
  const idx = memory.findIndex((p) => p.id === id && p.userId === userId);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  memory[idx] = { ...memory[idx], ...data };
  res.json(memory[idx]);
});

router.delete("/:id", async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user.sub;
  if (prisma) {
    const product = await prisma.product.findFirst({ where: { id, userId } });
    if (!product) return res.status(404).json({ error: "Not found" });
    await prisma.product.delete({ where: { id } });
    return res.json({ ok: true });
  }
  const idx = memory.findIndex((p) => p.id === id && p.userId === userId);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  memory.splice(idx, 1);
  res.json({ ok: true });
});

export default router;
