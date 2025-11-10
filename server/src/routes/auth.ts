import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { issueAccessToken, issueRefreshToken, setAuthCookies } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/auth.js";
import { getPrisma } from "../db.js";

let prisma: any = null;
try {
  prisma = getPrisma();
} catch {}

const memoryUsers: any[] = [];

const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    acceptCGU: z.boolean().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({ email: z.string().email(), password: z.string().min(1) }),
});

const router = Router();

router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const pwd = await hashPassword(password);
    let user;
    
    // Vérifier d'abord si l'utilisateur existe
    if (prisma) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          error: "Un compte existe déjà avec cette adresse email",
          message: "Vous pouvez vous connecter directement avec votre email et mot de passe",
          action: "login"
        });
      }
      user = await prisma.user.create({ data: { firstName, lastName, email, passwordHash: pwd } });
    } else {
      if (memoryUsers.find((u) => u.email === email)) {
        return res.status(409).json({
          error: "Un compte existe déjà avec cette adresse email",
          message: "Vous pouvez vous connecter directement avec votre email et mot de passe",
          action: "login"
        });
      }
      user = { id: String(memoryUsers.length + 1), firstName, lastName, email, passwordHash: pwd };
      memoryUsers.push(user);
    }
    const access = issueAccessToken({ sub: user.id, email: user.email });
    const refresh = issueRefreshToken({ sub: user.id, email: user.email });
    setAuthCookies(res, access, refresh);
    res.status(201).json({ id: user.id, email: user.email, firstName, lastName });
  } catch (e) { next(e); }
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let user;
    if (prisma) {
      user = await prisma.user.findUnique({ where: { email } });
    } else {
      user = memoryUsers.find((u) => u.email === email);
    }
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const access = issueAccessToken({ sub: user.id, email: user.email });
    const refresh = issueRefreshToken({ sub: user.id, email: user.email });
    setAuthCookies(res, access, refresh);
    res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
  } catch (e) { next(e); }
});

router.post("/refresh", (req, res) => {
  const token = req.cookies?.refresh_token as string | undefined;
  if (!token) return res.status(401).json({ error: "No refresh token" });
  try {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret) as any;
    const access = issueAccessToken({ sub: payload.sub, email: payload.email });
    res.cookie("access_token", access, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 15,
    });
    res.json({ ok: true });
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.get("/me", requireAuth, async (req: any, res) => {
  const userId = req.user.sub;
  if (prisma) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, firstName: true, lastName: true } });
    return res.json(user);
  }
  const user = memoryUsers.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
});

router.post("/logout", (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.json({ ok: true });
});

export default router;
