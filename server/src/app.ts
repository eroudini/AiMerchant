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
    "/forecast/stockout": { post: { summary: "Stockout days" } }
  }
};

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet());

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

  app.use("/auth", authRouter);
  app.use("/products", productsRouter);
  app.use("/pricing", pricingRouter);
  app.use("/forecast", forecastRouter);
  app.use("/", profileRouter);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, "unhandled");
    res.status(err.status || 500).json({ error: err.message || "Internal Error" });
  });

  return app;
}
