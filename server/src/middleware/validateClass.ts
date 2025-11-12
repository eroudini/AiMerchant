import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RequestHandler } from 'express';

export function validateQuery<T>(cls: new () => T): RequestHandler {
  return async (req, res, next) => {
    const instance = plainToInstance(cls, req.query, { enableImplicitConversion: true });
    const errors = await validate(instance as any, { whitelist: true, forbidUnknownValues: true });
    if (errors.length) return res.status(400).json({ error: 'ValidationError', details: errors });
    (req as any).validated = { ...(req as any).validated, query: instance };
    next();
  };
}

export function validateParams<T>(cls: new () => T): RequestHandler {
  return async (req, res, next) => {
    const instance = plainToInstance(cls, req.params, { enableImplicitConversion: true });
    const errors = await validate(instance as any, { whitelist: true, forbidUnknownValues: true });
    if (errors.length) return res.status(400).json({ error: 'ValidationError', details: errors });
    (req as any).validated = { ...(req as any).validated, params: instance };
    next();
  };
}

export function validateBody<T>(cls: new () => T): RequestHandler {
  return async (req, res, next) => {
    const instance = plainToInstance(cls, req.body, { enableImplicitConversion: true });
    const errors = await validate(instance as any, { whitelist: true, forbidUnknownValues: true });
    if (errors.length) return res.status(400).json({ error: 'ValidationError', details: errors });
    (req as any).validated = { ...(req as any).validated, body: instance };
    next();
  };
}
