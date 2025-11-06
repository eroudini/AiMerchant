import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export interface JwtClaims { sub: string; email: string }

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
