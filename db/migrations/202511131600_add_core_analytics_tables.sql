-- Core analytics and integration tables (Postgres)
-- Idempotent creation with IF NOT EXISTS guards

-- Helper: create extension for UUID if available
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  END IF;
EXCEPTION WHEN others THEN
  -- ignore (not critical)
END $$;

-- account
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'account' AND table_schema = 'public') THEN
    CREATE TABLE public.account (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  END IF;
END $$;

-- product (dimension) with composite PK (account_id, product_code)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product' AND table_schema = 'public') THEN
    CREATE TABLE public.product (
      account_id    TEXT NOT NULL,
      product_code  TEXT NOT NULL,
      name          TEXT,
      category      TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (account_id, product_code),
      CONSTRAINT fk_product_account FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_product_category ON public.product(category);
  END IF;
END $$;

-- listing: marketplace listing per product/channel/country
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listing' AND table_schema = 'public') THEN
    CREATE TABLE public.listing (
      account_id    TEXT NOT NULL,
      listing_id    TEXT NOT NULL,
      product_code  TEXT NOT NULL,
      channel       TEXT NOT NULL,
      country       TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (account_id, listing_id),
      CONSTRAINT fk_listing_account FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE,
      CONSTRAINT fk_listing_product FOREIGN KEY (account_id, product_code) REFERENCES public.product(account_id, product_code) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_listing_product ON public.listing(account_id, product_code);
    CREATE INDEX IF NOT EXISTS idx_listing_channel ON public.listing(channel, country);
  END IF;
END $$;

-- warehouse: inventory locations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouse' AND table_schema = 'public') THEN
    CREATE TABLE public.warehouse (
      account_id    TEXT NOT NULL,
      warehouse_id  TEXT NOT NULL,
      name          TEXT,
      country       TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (account_id, warehouse_id),
      CONSTRAINT fk_wh_account FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_warehouse_country ON public.warehouse(country);
  END IF;
END $$;

-- competitor dimension
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competitor' AND table_schema = 'public') THEN
    CREATE TABLE public.competitor (
      account_id     TEXT NOT NULL,
      competitor_id  TEXT NOT NULL,
      name           TEXT,
      website        TEXT,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (account_id, competitor_id),
      CONSTRAINT fk_comp_account FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE
    );
  END IF;
END $$;

-- sales_daily
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales_daily' AND table_schema = 'public') THEN
    CREATE TABLE public.sales_daily (
      date         DATE NOT NULL,
      account_id   TEXT NOT NULL,
      product_code TEXT NOT NULL,
      country      TEXT,
      units_sold   NUMERIC NOT NULL DEFAULT 0,
      revenue      NUMERIC NOT NULL DEFAULT 0,
      PRIMARY KEY (account_id, product_code, date),
      CONSTRAINT fk_sd_account FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE,
      CONSTRAINT fk_sd_product FOREIGN KEY (account_id, product_code) REFERENCES public.product(account_id, product_code) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_sales_daily_date ON public.sales_daily(date);
    CREATE INDEX IF NOT EXISTS idx_sales_daily_country ON public.sales_daily(country);
  END IF;
END $$;

-- inventory_daily
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_daily' AND table_schema = 'public') THEN
    CREATE TABLE public.inventory_daily (
      date         DATE NOT NULL,
      account_id   TEXT NOT NULL,
      product_code TEXT NOT NULL,
      country      TEXT,
      stock        NUMERIC,
      PRIMARY KEY (account_id, product_code, date),
      CONSTRAINT fk_id_account FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE,
      CONSTRAINT fk_id_product FOREIGN KEY (account_id, product_code) REFERENCES public.product(account_id, product_code) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_inventory_daily_date ON public.inventory_daily(date);
  END IF;
END $$;

-- price_daily
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'price_daily' AND table_schema = 'public') THEN
    CREATE TABLE public.price_daily (
      date         DATE NOT NULL,
      account_id   TEXT NOT NULL,
      product_code TEXT NOT NULL,
      country      TEXT,
      price        NUMERIC,
      PRIMARY KEY (account_id, product_code, date),
      CONSTRAINT fk_pd_account FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE,
      CONSTRAINT fk_pd_product FOREIGN KEY (account_id, product_code) REFERENCES public.product(account_id, product_code) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_price_daily_date ON public.price_daily(date);
  END IF;
END $$;

-- competitor_price_daily
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competitor_price_daily' AND table_schema = 'public') THEN
    CREATE TABLE public.competitor_price_daily (
      date            DATE NOT NULL,
      account_id      TEXT NOT NULL,
      product_code    TEXT NOT NULL,
      country         TEXT,
      competitor_id   TEXT NOT NULL,
      competitor_price NUMERIC,
      our_price       NUMERIC,
      PRIMARY KEY (account_id, product_code, competitor_id, date),
      CONSTRAINT fk_cpd_account FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE,
      CONSTRAINT fk_cpd_product FOREIGN KEY (account_id, product_code) REFERENCES public.product(account_id, product_code) ON DELETE CASCADE,
      CONSTRAINT fk_cpd_competitor FOREIGN KEY (account_id, competitor_id) REFERENCES public.competitor(account_id, competitor_id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_cpd_date ON public.competitor_price_daily(date);
  END IF;
END $$;

-- google_trends_daily
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'google_trends_daily' AND table_schema = 'public') THEN
    CREATE TABLE public.google_trends_daily (
      date        DATE NOT NULL,
      account_id  TEXT NOT NULL DEFAULT '',
      keyword     TEXT NOT NULL,
      country     TEXT NOT NULL DEFAULT '',
      score       NUMERIC NOT NULL,
      PRIMARY KEY (keyword, date, country, account_id)
    );
    CREATE INDEX IF NOT EXISTS idx_gtrends_country ON public.google_trends_daily(country);
  END IF;
END $$;

-- weather_daily (basic schema)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weather_daily' AND table_schema = 'public') THEN
    CREATE TABLE public.weather_daily (
      date        DATE NOT NULL,
      country     TEXT NOT NULL DEFAULT '',
      city        TEXT NOT NULL DEFAULT '',
      temp_avg_c  NUMERIC,
      rain_mm     NUMERIC,
      wind_kmh    NUMERIC,
      PRIMARY KEY (date, country, city)
    );
  END IF;
END $$;

-- forecast_product_daily
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forecast_product_daily' AND table_schema = 'public') THEN
    CREATE TABLE public.forecast_product_daily (
      date         DATE NOT NULL,
      account_id   TEXT NOT NULL,
      product_code TEXT NOT NULL,
      country      TEXT,
      yhat         NUMERIC NOT NULL,
      p10          NUMERIC,
      p90          NUMERIC,
      run_id       TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (account_id, product_code, date),
      CONSTRAINT fk_fpd_account FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE,
      CONSTRAINT fk_fpd_product FOREIGN KEY (account_id, product_code) REFERENCES public.product(account_id, product_code) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_fpd_date ON public.forecast_product_daily(date);
  END IF;
END $$;

-- recommendation (generic for analytics side)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recommendation' AND table_schema = 'public') THEN
    CREATE TABLE public.recommendation (
      id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      account_id   TEXT NOT NULL,
      product_code TEXT,
      type         TEXT NOT NULL,
      status       TEXT NOT NULL DEFAULT 'draft',
      payload      JSONB NOT NULL,
      note         TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT fk_rec_account FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE,
      CONSTRAINT fk_rec_product FOREIGN KEY (account_id, product_code) REFERENCES public.product(account_id, product_code) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_recommendation_account ON public.recommendation(account_id, type, status);
  END IF;
END $$;

-- action_execution_log (generic)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'action_execution_log' AND table_schema = 'public') THEN
    CREATE TABLE public.action_execution_log (
      id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      account_id   TEXT NOT NULL,
      product_code TEXT,
      type         TEXT NOT NULL,
      status       TEXT,
      message      TEXT,
      payload      JSONB,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT fk_ael_account FOREIGN KEY (account_id) REFERENCES public.account(id) ON DELETE CASCADE,
      CONSTRAINT fk_ael_product FOREIGN KEY (account_id, product_code) REFERENCES public.product(account_id, product_code) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_ael_account ON public.action_execution_log(account_id, type, created_at);
  END IF;
END $$;
