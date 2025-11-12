-- verify_schema.sql
-- Validation script: checks FKs, NOT NULLs, and currency/VAT consistency
-- Run after applying migrations and loading data

\echo 'Verifying schema constraints and data consistency...'

-- 1) Ensure core FK constraints exist (metadata check)
DO $$
DECLARE
  missing_count int := 0;
BEGIN
  -- product.account_id -> account.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    WHERE c.conrelid = 'product'::regclass AND c.contype = 'f'
  ) THEN
    RAISE WARNING 'Missing FK on product.account_id';
    missing_count := missing_count + 1;
  END IF;

  -- listing.account_id/product_id
  IF (SELECT count(*) FROM pg_constraint c WHERE c.conrelid = 'listing'::regclass AND c.contype = 'f') < 2 THEN
    RAISE WARNING 'Missing FK(s) on listing (account_id/product_id)';
    missing_count := missing_count + 1;
  END IF;

  -- comp_snapshot.account_id/competitor_id
  IF (SELECT count(*) FROM pg_constraint c WHERE c.conrelid = 'comp_snapshot'::regclass AND c.contype = 'f') < 2 THEN
    RAISE WARNING 'Missing FK(s) on comp_snapshot (account_id/competitor_id)';
    missing_count := missing_count + 1;
  END IF;

  -- price_policy.account_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c WHERE c.conrelid = 'price_policy'::regclass AND c.contype = 'f'
  ) THEN
    RAISE WARNING 'Missing FK on price_policy.account_id';
    missing_count := missing_count + 1;
  END IF;

  -- forecast.account_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c WHERE c.conrelid = 'forecast'::regclass AND c.contype = 'f'
  ) THEN
    RAISE WARNING 'Missing FK on forecast.account_id';
    missing_count := missing_count + 1;
  END IF;

  -- alerts.account_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c WHERE c.conrelid = 'alerts'::regclass AND c.contype = 'f'
  ) THEN
    RAISE WARNING 'Missing FK on alerts.account_id';
    missing_count := missing_count + 1;
  END IF;

  IF missing_count > 0 THEN
    RAISE NOTICE 'FK metadata check: % missing FKs reported via warnings', missing_count;
  ELSE
    RAISE NOTICE 'FK metadata check: OK';
  END IF;
END $$;

-- 2) Check NOT NULL columns are defined as NOT NULL (information_schema)
-- Example: account.name/default_currency/vat_rate must be NOT NULL
DO $$
DECLARE
  nn_missing int;
BEGIN
  SELECT count(*) INTO nn_missing FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'account'
    AND column_name IN ('name','default_currency','vat_rate')
    AND is_nullable = 'YES';
  IF nn_missing > 0 THEN
    RAISE EXCEPTION 'Account required columns are nullable: %', nn_missing;
  ELSE
    RAISE NOTICE 'NOT NULL check (account): OK';
  END IF;
END $$;

-- 3) Referential integrity data checks (orphan rows)
DO $$
DECLARE
  cnt int;
BEGIN
  SELECT count(*) INTO cnt
  FROM product p LEFT JOIN account a ON a.id = p.account_id
  WHERE a.id IS NULL;
  IF cnt > 0 THEN RAISE EXCEPTION 'Orphan products without account: %', cnt; END IF;

  SELECT count(*) INTO cnt
  FROM listing l LEFT JOIN product p ON p.id = l.product_id
  WHERE p.id IS NULL;
  IF cnt > 0 THEN RAISE EXCEPTION 'Orphan listings without product: %', cnt; END IF;

  SELECT count(*) INTO cnt
  FROM comp_snapshot s LEFT JOIN account a ON a.id = s.account_id
  WHERE a.id IS NULL;
  IF cnt > 0 THEN RAISE EXCEPTION 'Orphan comp_snapshot without account: %', cnt; END IF;

  RAISE NOTICE 'Orphan checks: OK';
END $$;

-- 4) Currency coherence: all currency_code must match account.default_currency (where present)
-- sales_ts
DO $$
DECLARE cnt int; BEGIN
  SELECT count(*) INTO cnt
  FROM sales_ts s
  JOIN account a ON a.id = s.account_id
  WHERE s.currency_code IS NOT NULL
    AND a.default_currency IS NOT NULL
    AND s.currency_code <> a.default_currency;
  IF cnt > 0 THEN RAISE EXCEPTION 'sales_ts currency mismatch rows: %', cnt; END IF;
  RAISE NOTICE 'sales_ts currency check: OK';
END $$;

-- fees_ts
DO $$
DECLARE cnt int; BEGIN
  SELECT count(*) INTO cnt
  FROM fees_ts s
  JOIN account a ON a.id = s.account_id
  WHERE s.currency_code IS NOT NULL
    AND a.default_currency IS NOT NULL
    AND s.currency_code <> a.default_currency;
  IF cnt > 0 THEN RAISE EXCEPTION 'fees_ts currency mismatch rows: %', cnt; END IF;
  RAISE NOTICE 'fees_ts currency check: OK';
END $$;

-- comp_snapshot
DO $$
DECLARE cnt int; BEGIN
  SELECT count(*) INTO cnt
  FROM comp_snapshot s
  JOIN account a ON a.id = s.account_id
  WHERE s.currency_code IS NOT NULL
    AND a.default_currency IS NOT NULL
    AND s.currency_code <> a.default_currency;
  IF cnt > 0 THEN RAISE EXCEPTION 'comp_snapshot currency mismatch rows: %', cnt; END IF;
  RAISE NOTICE 'comp_snapshot currency check: OK';
END $$;

-- 5) VAT coherence: vat_rate between 0 and 100 (enforced by constraint but double-check)
DO $$
DECLARE cnt int; BEGIN
  SELECT count(*) INTO cnt FROM account WHERE vat_rate < 0 OR vat_rate > 100;
  IF cnt > 0 THEN RAISE EXCEPTION 'Invalid VAT rows in account: %', cnt; END IF;
  RAISE NOTICE 'VAT range check: OK';
END $$;

\echo 'Verification complete.'
