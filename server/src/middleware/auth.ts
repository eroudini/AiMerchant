import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export interface JwtClaims { sub: string; email: string; account_id?: string; role?: 'viewer'|'admin' }

export const requireAuth: RequestHandler = (req, res, next) => {
  try {
    const token = req.cookies?.access_token as string | undefined;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret) as JwtClaims;
    // @ts-ignore
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export function requireRole(role: 'viewer'|'admin'): RequestHandler {
  return (req, res, next) => {
    const user = (req as any).user as JwtClaims | undefined;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const r = user.role || 'viewer';
    if (role === 'viewer') return next();
    if (role === 'admin' && r === 'admin') return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}
