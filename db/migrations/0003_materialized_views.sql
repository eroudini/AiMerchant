-- 0003_materialized_views.sql
-- Materialized views for KPI windows 7/30/90 days from sales_ts

-- Helper function to build a MV for a rolling window (idempotent pattern via DROP IF EXISTS then CREATE)
-- Note: Using NOW() binds the window to refresh-time. Schedule REFRESH MATERIALIZED VIEW for updates.

DROP MATERIALIZED VIEW IF EXISTS mv_kpis_7d;
CREATE MATERIALIZED VIEW mv_kpis_7d AS
SELECT
  account_id,
  marketplace,
  country,
  product_code,
  date_trunc('day', now())::timestamptz AS as_of,
  SUM(units_sold) AS units_7d,
  SUM(revenue) AS gmv_7d,
  SUM(COALESCE(margin, revenue - COALESCE(cogs,0))) AS margin_7d
FROM sales_ts
WHERE ts >= now() - INTERVAL '7 days'
GROUP BY 1,2,3,4,5;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpis_7d_unique ON mv_kpis_7d(account_id, marketplace, country, product_code);

DROP MATERIALIZED VIEW IF EXISTS mv_kpis_30d;
CREATE MATERIALIZED VIEW mv_kpis_30d AS
SELECT
  account_id,
  marketplace,
  country,
  product_code,
  date_trunc('day', now())::timestamptz AS as_of,
  SUM(units_sold) AS units_30d,
  SUM(revenue) AS gmv_30d,
  SUM(COALESCE(margin, revenue - COALESCE(cogs,0))) AS margin_30d
FROM sales_ts
WHERE ts >= now() - INTERVAL '30 days'
GROUP BY 1,2,3,4,5;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpis_30d_unique ON mv_kpis_30d(account_id, marketplace, country, product_code);

DROP MATERIALIZED VIEW IF EXISTS mv_kpis_90d;
CREATE MATERIALIZED VIEW mv_kpis_90d AS
SELECT
  account_id,
  marketplace,
  country,
  product_code,
  date_trunc('day', now())::timestamptz AS as_of,
  SUM(units_sold) AS units_90d,
  SUM(revenue) AS gmv_90d,
  SUM(COALESCE(margin, revenue - COALESCE(cogs,0))) AS margin_90d
FROM sales_ts
WHERE ts >= now() - INTERVAL '90 days'
GROUP BY 1,2,3,4,5;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpis_90d_unique ON mv_kpis_90d(account_id, marketplace, country, product_code);

-- Optional: partial aggregates by account to speed dashboards
DROP MATERIALIZED VIEW IF EXISTS mv_kpis_account_30d;
CREATE MATERIALIZED VIEW mv_kpis_account_30d AS
SELECT
  account_id,
  date_trunc('day', now())::timestamptz AS as_of,
  SUM(units_sold) AS units_30d,
  SUM(revenue) AS gmv_30d,
  SUM(COALESCE(margin, revenue - COALESCE(cogs,0))) AS margin_30d
FROM sales_ts
WHERE ts >= now() - INTERVAL '30 days'
GROUP BY 1,2;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpis_account_30d_unique ON mv_kpis_account_30d(account_id);

-- Hints: Use REFRESH MATERIALIZED VIEW CONCURRENTLY in jobs to keep dashboards responsive
