-- 0004_continuous_aggregates.sql
-- TimescaleDB Continuous Aggregates for daily KPIs from sales_ts
-- Idempotent: guarded with existence checks

-- Ensure TimescaleDB is available
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create a daily continuous aggregate over sales_ts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'ca_sales_daily'
  ) THEN
    CREATE MATERIALIZED VIEW ca_sales_daily
    WITH (timescaledb.continuous)
    AS
    SELECT
      time_bucket('1 day', ts) AS bucket,
      account_id,
      marketplace,
      country,
      product_code,
      SUM(units_sold)                    AS units,
      SUM(revenue)                       AS gmv,
      SUM(COALESCE(margin, revenue - COALESCE(cogs,0))) AS margin
    FROM sales_ts
    GROUP BY 1,2,3,4,5
    WITH NO DATA;

    -- Indexes to speed up filters by account/product and recent buckets
    CREATE INDEX IF NOT EXISTS idx_ca_sales_daily_core
      ON ca_sales_daily(account_id, marketplace, country, product_code, bucket DESC) WITH (fillfactor=90);

    -- Backfill and enable policy refresh (keeps last 90 days up-to-date, runs every 15 min)
    -- NOTE: add_continuous_aggregate_policy is no-op if Timescale job API is unavailable
    PERFORM refresh_continuous_aggregate('ca_sales_daily', now() - INTERVAL '365 days', now());

    PERFORM add_continuous_aggregate_policy(
      'ca_sales_daily',
      start_offset => INTERVAL '90 days',
      end_offset => INTERVAL '1 hour',
      schedule_interval => INTERVAL '15 minutes'
    );
  END IF;
END$$;

-- Convenience views on top of the daily CAGG for 7/30/90 days
CREATE OR REPLACE VIEW v_kpis_7d AS
SELECT
  account_id,
  marketplace,
  country,
  product_code,
  SUM(units)  AS units_7d,
  SUM(gmv)    AS gmv_7d,
  SUM(margin) AS margin_7d
FROM ca_sales_daily
WHERE bucket >= now() - INTERVAL '7 days'
GROUP BY 1,2,3,4;

CREATE OR REPLACE VIEW v_kpis_30d AS
SELECT
  account_id,
  marketplace,
  country,
  product_code,
  SUM(units)  AS units_30d,
  SUM(gmv)    AS gmv_30d,
  SUM(margin) AS margin_30d
FROM ca_sales_daily
WHERE bucket >= now() - INTERVAL '30 days'
GROUP BY 1,2,3,4;

CREATE OR REPLACE VIEW v_kpis_90d AS
SELECT
  account_id,
  marketplace,
  country,
  product_code,
  SUM(units)  AS units_90d,
  SUM(gmv)    AS gmv_90d,
  SUM(margin) AS margin_90d
FROM ca_sales_daily
WHERE bucket >= now() - INTERVAL '90 days'
GROUP BY 1,2,3,4;
