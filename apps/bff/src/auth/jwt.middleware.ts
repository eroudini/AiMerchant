import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly auth: AuthService) {}

  use(req: Request & { user?: any }, _res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring('Bearer '.length).trim();
      const claims = this.auth.verify(token);
      if (claims && claims.sub) {
        req.user = { accountId: claims.sub, claims };
      }
    }
    next();
  }
}
