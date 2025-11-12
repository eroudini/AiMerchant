import { RequestHandler } from 'express';
import { randomUUID } from 'crypto';

export const traceMiddleware: RequestHandler = (req, res, next) => {
  const traceId = req.headers['x-trace-id']?.toString() || randomUUID();
  (req as any).traceId = traceId;
  res.setHeader('X-Trace-Id', traceId);
  next();
};
