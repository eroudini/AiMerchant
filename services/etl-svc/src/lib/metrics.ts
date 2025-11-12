import client from 'prom-client';
import http from 'http';
import { logger } from './logger.js';

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const etlRunDuration = new client.Histogram({
  name: 'etl_run_duration_seconds',
  help: 'Duration of ETL pipeline run in seconds',
  labelNames: ['source', 'pipeline'],
  buckets: [0.5, 1, 2, 5, 10, 30, 60, 120, 300, 600],
});

export const etlRowsProcessed = new client.Counter({
  name: 'etl_rows_processed_total',
  help: 'Total rows processed',
  labelNames: ['source', 'table'],
});

export const etlErrors = new client.Counter({
  name: 'etl_errors_total',
  help: 'Total errors encountered',
  labelNames: ['source', 'stage'],
});

register.registerMetric(etlRunDuration);
register.registerMetric(etlRowsProcessed);
register.registerMetric(etlErrors);

export function startMetricsServer() {
  const port = Number(process.env.METRICS_PORT || 9464);
  const server = http.createServer(async (_req, res) => {
    if (_req.url === '/metrics') {
      const metrics = await register.metrics();
      res.writeHead(200, { 'Content-Type': register.contentType });
      res.end(metrics);
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  server.listen(port, () => logger.info({ port }, 'Prometheus metrics server listening'));
  return server;
}
