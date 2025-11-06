import jwt from "jsonwebtoken";
import { Response } from "express";

export function issueAccessToken(payload: Record<string, any>) {
  const secret = process.env.JWT_SECRET || "dev-secret";
  const exp = Math.floor(Date.now() / 1000) + 60 * 15; // 15 min
  return jwt.sign({ ...payload, exp }, secret);
}

export function issueRefreshToken(payload: Record<string, any>) {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "dev-secret";
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  return jwt.sign({ ...payload, exp }, secret);
}

export function setAuthCookies(res: Response, access: string, refresh: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("access_token", access, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 1000 * 60 * 15,
  });
  res.cookie("refresh_token", refresh, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}
