import { ZodSchema } from "zod";
import { RequestHandler } from "express";

export const validate = (schema: ZodSchema): RequestHandler => (req, _res, next) => {
  const data = { body: req.body, query: req.query, params: req.params };
  const result = schema.safeParse(data);
  if (!result.success) {
    return next({ status: 400, message: result.error.flatten() });
  }
  // attach parsed for downstream if needed
  // @ts-ignore
  req.parsed = result.data;
  return next();
};
