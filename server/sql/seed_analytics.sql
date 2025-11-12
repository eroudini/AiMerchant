-- Example seed for analytics DB (PostgreSQL/Timescale)
-- Adjust account_id and country to match your test JWT

-- Sales sample (daily revenue)
INSERT INTO sales_ts(account_id, country, marketplace, product_code, sku, ts, units_sold, revenue, currency_code)
VALUES
  ('acc-1','FR','shopify','P1','P1','2025-11-10T00:00:00Z', 5, 100.00, 'EUR'),
  ('acc-1','FR','shopify','P1','P1','2025-11-11T00:00:00Z', 8, 160.00, 'EUR');

-- Inventory sample (stock levels)
INSERT INTO inventory_ts(account_id, country, marketplace, product_code, sku, ts, value)
VALUES
  ('acc-1','FR','shopify','P1','P1','2025-11-10T00:00:00Z', 20),
  ('acc-1','FR','shopify','P1','P1','2025-11-11T00:00:00Z', 12);

-- Competitor diff snapshot
INSERT INTO comp_snapshot(account_id, country, product_code, competitor_id, ts, our_price, competitor_price)
VALUES
  ('acc-1','FR','P1','c1','2025-11-11T10:00:00Z', 20.00, 22.50);
