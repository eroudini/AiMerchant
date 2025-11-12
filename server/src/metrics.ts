import client from 'prom-client';
import { Router, RequestHandler } from 'express';

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});

register.registerMetric(httpRequestDuration);

export const metricsMiddleware: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1e9;
    const route = (req as any).route?.path || req.path || 'unknown';
    httpRequestDuration.labels(req.method, route, String(res.statusCode)).observe(duration);
  });
  next();
};

export const metricsRouter = Router();
metricsRouter.get('/', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});
