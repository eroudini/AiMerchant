import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import pino from "pino";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import authRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import pricingRouter from "./routes/pricing.js";
import forecastRouter from "./routes/forecast.js";
import profileRouter from "./routes/profile.js";
import bffRouter from "./routes/bff.js";
import { metricsMiddleware, metricsRouter } from "./metrics.js";
import { traceMiddleware } from "./middleware/trace.js";

const logger = pino({ name: "aimerchant-api" });

const openApiDoc = {
  openapi: "3.0.0",
  info: { title: "AIMerchant API", version: "0.1.0" },
  paths: {
    "/health": { get: { responses: { 200: { description: "ok" } } } },
    "/auth/register": { post: { summary: "Register" } },
    "/auth/login": { post: { summary: "Login" } },
    "/auth/refresh": { post: { summary: "Refresh" } },
    "/auth/me": { get: { summary: "Current user" } },
    "/products": { get: { summary: "List products" }, post: { summary: "Create product" } },
    "/pricing/suggest": { post: { summary: "Suggest price" } },
      "/forecast/stockout": { post: { summary: "Stockout days" } },
      "/bff/kpi/overview": { get: { summary: "KPIs overview (GMV, net margin, units, AOV)", parameters: [
        { name: "period", in: "query", required: true, schema: { type: "string", enum: ["last_7d","last_30d","last_90d"] } },
        { name: "country", in: "query", required: false, schema: { type: "string" } }
      ] } },
      "/bff/products/{id}/timeseries": { get: { summary: "Product timeseries (sales/price/stock)", parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
        { name: "metrics", in: "query", required: true, schema: { type: "string", example: "sales,stock" } },
        { name: "from", in: "query", required: true, schema: { type: "string", format: "date-time" } },
        { name: "to", in: "query", required: true, schema: { type: "string", format: "date-time" } },
        { name: "granularity", in: "query", required: false, schema: { type: "string", enum: ["day","hour"], default: "day" } },
        { name: "order", in: "query", required: false, schema: { type: "string", enum: ["asc","desc"], default: "asc" } },
        { name: "limit", in: "query", required: false, schema: { type: "integer" } }
      ] } },
      "/bff/competitors/diff": { get: { summary: "Competitor price diff over period", parameters: [
        { name: "period", in: "query", required: true, schema: { type: "string", enum: ["last_7d","last_30d","last_90d"] } },
        { name: "country", in: "query", required: false, schema: { type: "string" } }
      ] } }
      ,
      "/bff/market/heatmap": { get: { summary: "Market heatmap by category (avg price & delta % vs previous week)", parameters: [
        { name: "period", in: "query", required: true, schema: { type: "string", enum: ["last_7d"] } },
        { name: "country", in: "query", required: false, schema: { type: "string" } }
      ] } }
      ,
      "/bff/alerts/movements": { get: { summary: "Alerts for price/stock movements (last 7d vs previous 7d)", parameters: [
        { name: "period", in: "query", required: true, schema: { type: "string", enum: ["last_7d"] } },
        { name: "country", in: "query", required: false, schema: { type: "string" } },
        { name: "types", in: "query", required: false, schema: { type: "string", example: "price,stock" } },
        { name: "threshold", in: "query", required: false, schema: { type: "integer", example: 10 } },
        { name: "limit", in: "query", required: false, schema: { type: "integer", example: 20 } }
      ] } }
      ,
      "/bff/pricing/simulate": { get: { summary: "Simple revenue simulation for a price delta (elasticity-driven)", parameters: [
        { name: "sku", in: "query", required: true, schema: { type: "string" } },
        { name: "delta", in: "query", required: true, schema: { type: "number" }, description: "Percent delta, e.g. -5 or 10" },
        { name: "country", in: "query", required: false, schema: { type: "string" } }
      ] } }
      ,
      "/bff/stock/predict": { get: { summary: "Predict stockout date with avg daily sales and current stock", parameters: [
        { name: "product", in: "query", required: true, schema: { type: "string" } },
        { name: "lead_days", in: "query", required: false, schema: { type: "integer" }, description: "Supplier lead time in days (default 7)" },
        { name: "country", in: "query", required: false, schema: { type: "string" } }
      ] } }
      ,
      "/bff/radar/trends": { get: { summary: "ProductRadar trends (growth current window vs previous)", parameters: [
        { name: "period", in: "query", required: true, schema: { type: "string", enum: ["last_30d","last_90d"] } },
        { name: "type", in: "query", required: false, schema: { type: "string", enum: ["category","product"], default: "category" } },
        { name: "country", in: "query", required: false, schema: { type: "string" } },
        { name: "limit", in: "query", required: false, schema: { type: "integer" } }
      ] } }
      ,
      "/bff/export/csv": { get: { summary: "Export data as CSV", parameters: [
        { name: "resource", in: "query", required: true, schema: { type: "string", enum: ["radar_trends","market_heatmap","competitors_diff","alerts_movements"] } },
        { name: "period", in: "query", required: false, schema: { type: "string" } },
        { name: "type", in: "query", required: false, schema: { type: "string", enum: ["category","product"] } },
        { name: "country", in: "query", required: false, schema: { type: "string" } },
        { name: "limit", in: "query", required: false, schema: { type: "integer" } },
        { name: "types", in: "query", required: false, schema: { type: "string", example: "price,stock" } },
        { name: "threshold", in: "query", required: false, schema: { type: "integer" } }
      ] } }
  }
};

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(traceMiddleware);
  app.use(metricsMiddleware);

  const allowList = (process.env.CORS_ORIGIN || "http://localhost:3000").split(",").map(s=>s.trim());
  const localhostRegex = /^http:\/\/localhost:\d+$/;
  const loopbackRegex = /^http:\/\/127\.0\.0\.1:\d+$/;
  const corsOptions: cors.CorsOptions = {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const allowed = allowList.includes(origin) || localhostRegex.test(origin) || loopbackRegex.test(origin);
      if (process.env.NODE_ENV !== "production") logger.info({ origin, allowed }, "CORS check");
      return allowed ? callback(null, true) : callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  };
  app.use(cors(corsOptions));

  app.use(rateLimit({ windowMs: 60_000, max: 120 }));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));
  app.use("/metrics", metricsRouter);

  app.use("/auth", authRouter);
  app.use("/products", productsRouter);
  app.use("/pricing", pricingRouter);
  app.use("/forecast", forecastRouter);
  app.use("/", profileRouter);
  app.use("/bff", bffRouter);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, "unhandled");
    res.status(err.status || 500).json({ error: err.message || "Internal Error" });
  });

  return app;
}
