-- 0002_timeseries.sql
-- Time-series tables using TimescaleDB (PostgreSQL 15)

-- Timescale extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- SALES time-series
CREATE TABLE IF NOT EXISTS sales_ts (
  account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  country TEXT NOT NULL,
  sku TEXT NULL,
  asin TEXT NULL,
  product_code TEXT GENERATED ALWAYS AS (COALESCE(NULLIF(sku, ''), NULLIF(asin, ''))) STORED,
  ts TIMESTAMPTZ NOT NULL,
  units_sold INT NOT NULL DEFAULT 0,
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  margin NUMERIC(12,2) NULL,
  cogs NUMERIC(12,2) NULL,
  currency_code CHAR(3) NOT NULL,
  attrs JSONB NULL,
  PRIMARY KEY (account_id, marketplace, country, product_code, ts)
);
ALTER TABLE sales_ts
  ADD CONSTRAINT sales_ts_product_code_nn CHECK (product_code IS NOT NULL) NOT VALID;

-- INVENTORY time-series
CREATE TABLE IF NOT EXISTS inventory_ts (
  account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  country TEXT NOT NULL,
  sku TEXT NULL,
  asin TEXT NULL,
  product_code TEXT GENERATED ALWAYS AS (COALESCE(NULLIF(sku, ''), NULLIF(asin, ''))) STORED,
  ts TIMESTAMPTZ NOT NULL,
  on_hand INT NOT NULL DEFAULT 0,
  in_transit INT NOT NULL DEFAULT 0,
  reserved INT NOT NULL DEFAULT 0,
  backordered INT NULL,
  attrs JSONB NULL,
  PRIMARY KEY (account_id, marketplace, country, product_code, ts)
);
ALTER TABLE inventory_ts
  ADD CONSTRAINT inventory_ts_product_code_nn CHECK (product_code IS NOT NULL) NOT VALID;

-- FEES time-series
CREATE TABLE IF NOT EXISTS fees_ts (
  account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  country TEXT NOT NULL,
  sku TEXT NULL,
  asin TEXT NULL,
  product_code TEXT GENERATED ALWAYS AS (COALESCE(NULLIF(sku, ''), NULLIF(asin, ''))) STORED,
  ts TIMESTAMPTZ NOT NULL,
  fee_type TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency_code CHAR(3) NOT NULL,
  details JSONB NULL,
  PRIMARY KEY (account_id, marketplace, country, product_code, ts, fee_type)
);
ALTER TABLE fees_ts
  ADD CONSTRAINT fees_ts_product_code_nn CHECK (product_code IS NOT NULL) NOT VALID;

-- REVIEWS time-series
CREATE TABLE IF NOT EXISTS reviews_ts (
  account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  country TEXT NOT NULL,
  sku TEXT NULL,
  asin TEXT NULL,
  product_code TEXT GENERATED ALWAYS AS (COALESCE(NULLIF(sku, ''), NULLIF(asin, ''))) STORED,
  ts TIMESTAMPTZ NOT NULL,
  rating INT NULL CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  reviews_count INT NULL,
  rating_avg NUMERIC(4,2) NULL,
  source TEXT NULL,
  payload JSONB NULL,
  PRIMARY KEY (account_id, marketplace, country, product_code, ts)
);
ALTER TABLE reviews_ts
  ADD CONSTRAINT reviews_ts_product_code_nn CHECK (product_code IS NOT NULL) NOT VALID;

-- Create hypertables (idempotent)
SELECT create_hypertable('sales_ts', 'ts', if_not_exists => TRUE, migrate_data => TRUE, chunk_time_interval => INTERVAL '7 days');
SELECT create_hypertable('inventory_ts', 'ts', if_not_exists => TRUE, migrate_data => TRUE, chunk_time_interval => INTERVAL '7 days');
SELECT create_hypertable('fees_ts', 'ts', if_not_exists => TRUE, migrate_data => TRUE, chunk_time_interval => INTERVAL '7 days');
SELECT create_hypertable('reviews_ts', 'ts', if_not_exists => TRUE, migrate_data => TRUE, chunk_time_interval => INTERVAL '7 days');

-- Recommended indexes
CREATE INDEX IF NOT EXISTS idx_sales_ts_core ON sales_ts(account_id, marketplace, country, product_code, ts DESC) WITH (fillfactor=90);
CREATE INDEX IF NOT EXISTS idx_sales_ts_time ON sales_ts(ts DESC);
CREATE INDEX IF NOT EXISTS idx_sales_ts_attrs_gin ON sales_ts USING GIN (attrs);

CREATE INDEX IF NOT EXISTS idx_inventory_ts_core ON inventory_ts(account_id, marketplace, country, product_code, ts DESC) WITH (fillfactor=90);
CREATE INDEX IF NOT EXISTS idx_inventory_ts_time ON inventory_ts(ts DESC);

CREATE INDEX IF NOT EXISTS idx_fees_ts_core ON fees_ts(account_id, marketplace, country, product_code, ts DESC) WITH (fillfactor=90);
CREATE INDEX IF NOT EXISTS idx_fees_ts_time ON fees_ts(ts DESC);
CREATE INDEX IF NOT EXISTS idx_fees_ts_details_gin ON fees_ts USING GIN (details);

CREATE INDEX IF NOT EXISTS idx_reviews_ts_core ON reviews_ts(account_id, marketplace, country, product_code, ts DESC) WITH (fillfactor=90);
CREATE INDEX IF NOT EXISTS idx_reviews_ts_time ON reviews_ts(ts DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_ts_payload_gin ON reviews_ts USING GIN (payload);

-- Enable compression & policies (idempotent)
ALTER TABLE IF EXISTS sales_ts SET (timescaledb.compress, timescaledb.compress_segmentby = 'account_id,marketplace,country,product_code');
ALTER TABLE IF EXISTS inventory_ts SET (timescaledb.compress, timescaledb.compress_segmentby = 'account_id,marketplace,country,product_code');
ALTER TABLE IF EXISTS fees_ts SET (timescaledb.compress, timescaledb.compress_segmentby = 'account_id,marketplace,country,product_code');
ALTER TABLE IF EXISTS reviews_ts SET (timescaledb.compress, timescaledb.compress_segmentby = 'account_id,marketplace,country,product_code');

-- Compression after 90 days, retention 365 days
DO $$ BEGIN
  PERFORM add_compression_policy('sales_ts', INTERVAL '90 days');
EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN
  PERFORM add_compression_policy('inventory_ts', INTERVAL '90 days');
EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN
  PERFORM add_compression_policy('fees_ts', INTERVAL '90 days');
EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN
  PERFORM add_compression_policy('reviews_ts', INTERVAL '90 days');
EXCEPTION WHEN undefined_function THEN NULL; END $$;

DO $$ BEGIN
  PERFORM add_retention_policy('sales_ts', INTERVAL '365 days');
EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN
  PERFORM add_retention_policy('inventory_ts', INTERVAL '365 days');
EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN
  PERFORM add_retention_policy('fees_ts', INTERVAL '365 days');
EXCEPTION WHEN undefined_function THEN NULL; END $$;
DO $$ BEGIN
  PERFORM add_retention_policy('reviews_ts', INTERVAL '365 days');
EXCEPTION WHEN undefined_function THEN NULL; END $$;
