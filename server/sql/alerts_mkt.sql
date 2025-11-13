-- Materialized view for alerts (price and stock) over last 7 days vs previous 7 days
-- Requires PostgreSQL + TimescaleDB-like tables: price_ts, inventory_ts, and optional product dim.
-- Columns: type ('price'|'stock'), account_id, country, product_code, product_name, category, current, previous, delta_pct, generated_at

CREATE MATERIALIZED VIEW IF NOT EXISTS etl_alerts_mkt AS
WITH price_cur AS (
  SELECT account_id, country, product_code, AVG(price) AS cur
  FROM price_ts
  WHERE ts >= now() - interval '7 days'
  GROUP BY 1,2,3
), price_prev AS (
  SELECT account_id, country, product_code, AVG(price) AS prev
  FROM price_ts
  WHERE ts >= now() - interval '14 days' AND ts < now() - interval '7 days'
  GROUP BY 1,2,3
), stock_cur AS (
  SELECT account_id, country, product_code, LAST(value, ts) AS cur
  FROM inventory_ts
  WHERE ts >= now() - interval '7 days'
  GROUP BY 1,2,3
), stock_prev AS (
  SELECT account_id, country, product_code, LAST(value, ts) AS prev
  FROM inventory_ts
  WHERE ts >= now() - interval '14 days' AND ts < now() - interval '7 days'
  GROUP BY 1,2,3
)
SELECT 'price'::text AS type,
       COALESCE(pc.account_id, pp.account_id) AS account_id,
       COALESCE(pc.country, pp.country) AS country,
       COALESCE(pc.product_code, pp.product_code) AS product_code,
       p.name AS product_name,
       p.category AS category,
       pc.cur AS current,
       pp.prev AS previous,
       CASE WHEN COALESCE(pp.prev,0) = 0 THEN 0 ELSE (pc.cur - pp.prev)/NULLIF(pp.prev,0) * 100 END AS delta_pct,
       now() AS generated_at
FROM price_cur pc
LEFT JOIN price_prev pp ON pp.product_code=pc.product_code AND pp.account_id=pc.account_id AND pp.country=pc.country
LEFT JOIN product p ON p.product_code=pc.product_code AND p.account_id=pc.account_id
UNION ALL
SELECT 'stock'::text AS type,
       COALESCE(sc.account_id, sp.account_id) AS account_id,
       COALESCE(sc.country, sp.country) AS country,
       COALESCE(sc.product_code, sp.product_code) AS product_code,
       p.name AS product_name,
       p.category AS category,
       COALESCE(sc.cur,0) AS current,
       COALESCE(sp.prev,0) AS previous,
       CASE WHEN COALESCE(sp.prev,0) = 0 THEN 0 ELSE (COALESCE(sc.cur,0) - COALESCE(sp.prev,0))/NULLIF(sp.prev,0) * 100 END AS delta_pct,
       now() AS generated_at
FROM stock_cur sc
FULL JOIN stock_prev sp ON sp.product_code=sc.product_code AND sp.account_id=sc.account_id AND sp.country=sc.country
LEFT JOIN product p ON p.product_code=COALESCE(sc.product_code, sp.product_code) AND p.account_id=COALESCE(sc.account_id, sp.account_id);

CREATE INDEX IF NOT EXISTS etl_alerts_mkt_idx1 ON etl_alerts_mkt(account_id, country, type);
CREATE INDEX IF NOT EXISTS etl_alerts_mkt_idx2 ON etl_alerts_mkt(product_code);

-- Refresh command (manual):
--   REFRESH MATERIALIZED VIEW CONCURRENTLY etl_alerts_mkt;
-- Schedule: run every 15 minutes with your scheduler of choice.