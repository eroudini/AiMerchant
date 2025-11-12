export type Source = 'amazon' | 'shopify';

export interface WatermarkKey {
  source: Source;
  table: string; // logical stream e.g., 'listings', 'sales_ts', 'catalog'
  account_id: string; // UUID of account in unified DB
}

export interface WatermarkValue {
  // could be ISO timestamp or incremental id
  cursor_ts?: string; // ISO string
  cursor_id?: string;
}

export interface UnifiedProduct {
  account_id: string;
  marketplace: string; // 'amazon' | 'shopify' | marketplace name
  country: string;
  sku?: string;
  asin?: string;
  product_code: string; // coalesce(sku, asin)
  title?: string;
  category?: string;
  brand?: string;
  cost?: number;
  currency_code?: string; // 3 letters
}

export interface UnifiedListing {
  account_id: string;
  product_code: string;
  marketplace: string;
  country: string;
  marketplace_listing_id: string;
  sku?: string;
  asin?: string;
  url?: string;
  status?: 'active' | 'inactive' | 'draft' | 'archived';
}

export interface UnifiedSaleTS {
  account_id: string;
  marketplace: string;
  country: string;
  product_code: string;
  sku?: string;
  asin?: string;
  ts: string; // ISO timestamp
  units_sold: number;
  revenue: number;
  cogs?: number;
  margin?: number;
  currency_code: string;
  attrs?: Record<string, unknown> | null;
}

export interface UnifiedFeesTS {
  account_id: string;
  marketplace: string;
  country: string;
  product_code: string;
  sku?: string;
  asin?: string;
  ts: string;
  fee_type: string;
  amount: number;
  currency_code: string;
  details?: Record<string, unknown> | null;
}
