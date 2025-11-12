-- 0001_init.sql
-- PostgreSQL 15 - Base schema (idempotent)
-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Accounts
CREATE TABLE IF NOT EXISTS account (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  default_currency CHAR(3) NOT NULL,
  vat_rate NUMERIC(5,2) NOT NULL CHECK (vat_rate >= 0 AND vat_rate <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS product (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  country TEXT NOT NULL,
  sku TEXT NULL,
  asin TEXT NULL,
  -- Product code derived from sku|asin when present
  product_code TEXT GENERATED ALWAYS AS (COALESCE(NULLIF(sku, ''), NULLIF(asin, ''))) STORED,
  title TEXT NULL,
  category TEXT NULL,
  brand TEXT NULL,
  cost NUMERIC(12,2) NULL,
  currency_code CHAR(3) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (COALESCE(sku, asin) IS NOT NULL),
  UNIQUE (account_id, marketplace, country, product_code)
);
CREATE INDEX IF NOT EXISTS idx_product_account_market_code ON product(account_id, marketplace, country, product_code) WITH (fillfactor=90);

-- Listings (mapping products to marketplace listing identifiers)
CREATE TABLE IF NOT EXISTS listing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  country TEXT NOT NULL,
  marketplace_listing_id TEXT NOT NULL,
  sku TEXT NULL,
  asin TEXT NULL,
  url TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, marketplace_listing_id)
);
CREATE INDEX IF NOT EXISTS idx_listing_acc_prod ON listing(account_id, product_id);
CREATE INDEX IF NOT EXISTS idx_listing_lookup ON listing(account_id, marketplace, country, COALESCE(NULLIF(sku,''), NULLIF(asin,'')));

-- Competitors directory
CREATE TABLE IF NOT EXISTS competitor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  marketplace TEXT NOT NULL,
  country TEXT NOT NULL,
  domain TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_competitor_mkt ON competitor(marketplace, country);

-- Competitor snapshots (price/availability observations)
CREATE TABLE IF NOT EXISTS comp_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  competitor_id UUID NOT NULL REFERENCES competitor(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  country TEXT NOT NULL,
  sku TEXT NULL,
  asin TEXT NULL,
  product_code TEXT GENERATED ALWAYS AS (COALESCE(NULLIF(sku, ''), NULLIF(asin, ''))) STORED,
  ts TIMESTAMPTZ NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  shipping NUMERIC(12,2) NULL,
  currency_code CHAR(3) NOT NULL,
  availability TEXT NULL,
  url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE comp_snapshot
  ADD CONSTRAINT comp_snapshot_product_code_nn CHECK (product_code IS NOT NULL) NOT VALID;
CREATE INDEX IF NOT EXISTS idx_comp_snap_core ON comp_snapshot(account_id, marketplace, country, product_code, ts DESC) WITH (fillfactor=90);
CREATE INDEX IF NOT EXISTS idx_comp_snap_comp ON comp_snapshot(competitor_id, ts DESC);

-- Price policy (rules)
CREATE TABLE IF NOT EXISTS price_policy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  country TEXT NOT NULL,
  product_code TEXT NULL,
  min_margin_pct NUMERIC(5,2) NULL CHECK (min_margin_pct >= 0 AND min_margin_pct <= 100),
  target_margin_pct NUMERIC(5,2) NULL CHECK (target_margin_pct >= 0 AND target_margin_pct <= 100),
  max_margin_pct NUMERIC(5,2) NULL CHECK (max_margin_pct >= 0 AND max_margin_pct <= 100),
  floor_price NUMERIC(12,2) NULL,
  ceiling_price NUMERIC(12,2) NULL,
  currency_code CHAR(3) NULL,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ NULL,
  CHECK (floor_price IS NULL OR ceiling_price IS NULL OR floor_price <= ceiling_price)
);
CREATE INDEX IF NOT EXISTS idx_price_policy_scope ON price_policy(account_id, marketplace, country, product_code, effective_from);

-- Forecasts (predictions). Not a hypertable by constraint, but ts present for keys and indexing
CREATE TABLE IF NOT EXISTS forecast (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  country TEXT NOT NULL,
  product_code TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  horizon_days INT NOT NULL CHECK (horizon_days > 0),
  units INT NULL,
  revenue NUMERIC(12,2) NULL,
  margin NUMERIC(12,2) NULL,
  currency_code CHAR(3) NULL,
  model_version TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, marketplace, country, product_code, ts, horizon_days)
);
CREATE INDEX IF NOT EXISTS idx_forecast_lookup ON forecast(account_id, marketplace, country, product_code, ts DESC);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info','warning','error','critical')),
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','ack','resolved')),
  payload JSONB NULL,
  resolved_at TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS idx_alerts_core ON alerts(account_id, type, status, ts DESC) WITH (fillfactor=90);
CREATE INDEX IF NOT EXISTS idx_alerts_payload_gin ON alerts USING GIN (payload);

-- Helpful views or enums could be added later
