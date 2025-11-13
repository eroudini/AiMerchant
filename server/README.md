# AIMerchant Server (Node/Express/TS)

## Setup

1. Create `.env` in `server/` from the following template (MySQL for Prisma app DB; optional Postgres/Timescale for analytics via ANALYTICS_DATABASE_URL):

```
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=mysql://user:password@localhost:3306/aimerchant
JWT_SECRET=dev-secret
JWT_REFRESH_SECRET=dev-refresh-secret
# Optional analytics DB (used by BFF read-only KPIs if configured)
# ANALYTICS_DATABASE_URL=postgresql://user:password@localhost:5432/analytics
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
- `GET /bff/market/heatmap?period=last_7d&country=FR`
- `GET /bff/alerts/movements?period=last_7d&country=FR&types=price,stock&threshold=10&limit=20`

Auth: cookie `access_token` (JWT) avec claims `{ sub, account_id?, role? }`. RBAC minimal: `viewer` ou `admin`.

Métriques: `GET /metrics` (Prometheus). Tracing simple via header/response `X-Trace-Id`.

DB analytique: Le BFF lit dans PostgreSQL/Timescale via `ANALYTICS_DATABASE_URL`. Exemple de seed: `server/sql/seed_analytics.sql`.

Alertes matérialisées (recommandé):

1. Créez la vue matérialisée des alertes prix/stock (Δ 7j vs 7j précédents):

```
psql "$ANALYTICS_DATABASE_URL" -f server/sql/alerts_mkt.sql
```

2. Rafraîchissez périodiquement (ex: toutes les 15 min):

```
psql "$ANALYTICS_DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY etl_alerts_mkt;"
```

3. Le BFF utilise automatiquement `etl_alerts_mkt` si présent; sinon, il calcule à la volée à partir de `price_ts` et `inventory_ts`.

Notes: si Prisma/DB non configurés, l’API fonctionne en mémoire (MVP). Configure `DATABASE_URL` puis `pnpm prisma:migrate` pour activer la DB.

### Forecast: Import artefacts → DB (DB-first)

Si vous avez des artefacts de forecast sous `forecasting/artifacts` (par exemple générés par `forecasting/train.py`), vous pouvez les importer dans les tables Prisma `ForecastRun`/`ForecastResult` :

```
pnpm prisma:generate
pnpm prisma:migrate --name forecast_init
pnpm forecast:import -- --productId csv --country FR --channel AMAZON --horizon 30
```

Paramètres:
- `--productId` (ex: `csv` pour les runs de démonstration; sinon identifiant produit)
- `--country` (défaut `FR`)
- `--channel` (défaut `AMAZON`)
- `--horizon` (optionnel)

Le BFF lira désormais en priorité la DB pour `GET /bff/forecast/demand`.
