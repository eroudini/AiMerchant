import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

export interface JwtClaims {
  sub: string; // account id
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private secret: string;
  private defaultTtlSeconds: number;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'devsecret123';
    this.defaultTtlSeconds = Number(process.env.JWT_TTL_SECONDS || 3600);
  }

  sign(accountId: string, ttlSeconds?: number) {
    const payload: JwtClaims = { sub: accountId };
    return jwt.sign(payload, this.secret, { expiresIn: ttlSeconds || this.defaultTtlSeconds });
  }

  verify(token: string): JwtClaims | null {
    try {
      return jwt.verify(token, this.secret) as JwtClaims;
    } catch {
      return null;
    }
  }
}
