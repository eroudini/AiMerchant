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

Notes: si Prisma/DB non configurés, l’API fonctionne en mémoire (MVP). Configure `DATABASE_URL` puis `pnpm prisma:migrate` pour activer Postgres.
