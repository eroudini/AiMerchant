# AIMerchant Server (Node/Express/TS)

## Setup

1. Create `.env` in `server/` from the following template:

```
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/aimerchant
JWT_SECRET=dev-secret
JWT_REFRESH_SECRET=dev-refresh-secret
```

2. Install deps and run:

```
cd server
pnpm install
pnpm prisma:generate
pnpm dev
```

3. Endpoints
- `GET /health`
- `POST /auth/register` `{ firstName,lastName,email,password }`
- `POST /auth/login` `{ email,password }`
- `POST /auth/logout`
- `GET /products` (query `search`)
- `POST /products` `{ sku,title,buyPrice,fees,price,stock,marketplace }`
- `PATCH /products/:id`
- `DELETE /products/:id`
- `POST /pricing/suggest` `{ buyPrice,fees,competitorPrice,marginMin,marginMax }`
- `POST /forecast/stockout` `{ stock,avgDailySales }`

### BFF (read-only KPIs)

- `GET /bff/kpi/overview?period=last_7d&country=FR` → `{ gmv, net_margin, units, aov }`
- `GET /bff/products/:id/timeseries?metrics=sales,price,stock&from=...&to=...&granularity=day&order=asc&limit=500`
- `GET /bff/competitors/diff?period=last_7d&country=FR`

Auth: cookie `access_token` (JWT) avec claims `{ sub, account_id?, role? }`. RBAC minimal: `viewer` ou `admin`.

Métriques: `GET /metrics` (Prometheus). Tracing simple via header/response `X-Trace-Id`.

DB analytique: Le BFF lit dans PostgreSQL/Timescale via `ANALYTICS_DATABASE_URL`. Exemple de seed: `server/sql/seed_analytics.sql`.

Notes: si Prisma/DB non configurés, l’API fonctionne en mémoire (MVP). Configure `DATABASE_URL` puis `pnpm prisma:migrate` pour activer Postgres.
