-- Alerts materialization (price & stock movements)
-- Requires TimescaleDB and base hypertables price_ts(product_code, account_id, country, ts, price)
-- and inventory_ts(product_code, account_id, country, ts, value)

-- Example view: price movement last 7d vs previous 7d
CREATE OR REPLACE VIEW v_alerts_price_7d AS
WITH cur AS (
  SELECT account_id, country, product_code, AVG(price) AS cur
  FROM price_ts
  WHERE ts >= now() - interval '7 days'
  GROUP BY 1,2,3
), prev AS (
  SELECT account_id, country, product_code, AVG(price) AS prev
  FROM price_ts
  WHERE ts >= now() - interval '14 days' AND ts < now() - interval '7 days'
  GROUP BY 1,2,3
)
SELECT c.account_id, c.country, c.product_code,
       c.cur AS current, p.prev AS previous,
       CASE WHEN p.prev = 0 OR p.prev IS NULL THEN NULL ELSE (c.cur - p.prev)/p.prev * 100 END AS delta_pct
FROM cur c
LEFT JOIN prev p ON p.account_id=c.account_id AND p.country=c.country AND p.product_code=c.product_code
WHERE p.prev IS NOT NULL;

-- Example view: stock movement last vs previous 7d window
CREATE OR REPLACE VIEW v_alerts_stock_7d AS
WITH cur AS (
  SELECT account_id, country, product_code, LAST(value, ts) AS cur
  FROM inventory_ts
  WHERE ts >= now() - interval '7 days'
  GROUP BY 1,2,3
), prev AS (
  SELECT account_id, country, product_code, LAST(value, ts) AS prev
  FROM inventory_ts
  WHERE ts >= now() - interval '14 days' AND ts < now() - interval '7 days'
  GROUP BY 1,2,3
)
SELECT COALESCE(c.account_id,p.account_id) AS account_id,
       COALESCE(c.country,p.country) AS country,
       COALESCE(c.product_code,p.product_code) AS product_code,
       COALESCE(c.cur,0) AS current,
       COALESCE(p.prev,0) AS previous,
       CASE WHEN COALESCE(p.prev,0)=0 THEN NULL ELSE (COALESCE(c.cur,0) - COALESCE(p.prev,0))/NULLIF(p.prev,0) * 100 END AS delta_pct
FROM cur c
FULL JOIN prev p ON p.account_id=c.account_id AND p.country=c.country AND p.product_code=c.product_code;

-- You can materialize with a continuous aggregate for performance if needed.
-- Example (TimescaleDB >=2):
-- CREATE MATERIALIZED VIEW caggs_alerts_price_7d
-- WITH (timescaledb.continuous) AS
-- SELECT time_bucket('1 day', ts) AS bucket, account_id, country, product_code, AVG(price) AS avg_price
-- FROM price_ts
-- GROUP BY 1,2,3,4;
-- Then derive the 7d vs prev 7d deltas from this cagg.
