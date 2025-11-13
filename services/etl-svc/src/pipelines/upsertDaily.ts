import { query } from '../lib/db.js';

export interface SalesDailyRow {
  date: string; // YYYY-MM-DD
  account_id: string;
  product_code: string;
  country?: string | null;
  units_sold: number;
  revenue: number;
}

export async function upsertSalesDaily(rows: SalesDailyRow[]) {
  if (!rows.length) return 0;
  const values: any[] = [];
  const chunks: string[] = [];
  rows.forEach((r, i) => {
    const j = i * 6;
    chunks.push(`($${j + 1},$${j + 2},$${j + 3},$${j + 4},$${j + 5},$${j + 6})`);
    values.push(r.date, r.account_id, r.product_code, r.country ?? null, r.units_sold, r.revenue);
  });
  const sql = `INSERT INTO sales_daily(date, account_id, product_code, country, units_sold, revenue)
               VALUES ${chunks.join(',')}
               ON CONFLICT (account_id, product_code, date)
               DO UPDATE SET units_sold = EXCLUDED.units_sold, revenue = EXCLUDED.revenue, country = COALESCE(EXCLUDED.country, sales_daily.country)`;
  const res = await query(sql, values);
  return (res as any).rowCount ?? rows.length;
}

export interface InventoryDailyRow {
  date: string;
  account_id: string;
  product_code: string;
  country?: string | null;
  stock?: number | null;
}

export async function upsertInventoryDaily(rows: InventoryDailyRow[]) {
  if (!rows.length) return 0;
  const values: any[] = [];
  const chunks: string[] = [];
  rows.forEach((r, i) => {
    const j = i * 5;
    chunks.push(`($${j + 1},$${j + 2},$${j + 3},$${j + 4},$${j + 5})`);
    values.push(r.date, r.account_id, r.product_code, r.country ?? null, r.stock ?? null);
  });
  const sql = `INSERT INTO inventory_daily(date, account_id, product_code, country, stock)
               VALUES ${chunks.join(',')}
               ON CONFLICT (account_id, product_code, date)
               DO UPDATE SET stock = EXCLUDED.stock, country = COALESCE(EXCLUDED.country, inventory_daily.country)`;
  const res = await query(sql, values);
  return (res as any).rowCount ?? rows.length;
}

export interface PriceDailyRow {
  date: string;
  account_id: string;
  product_code: string;
  country?: string | null;
  price?: number | null;
}

export async function upsertPriceDaily(rows: PriceDailyRow[]) {
  if (!rows.length) return 0;
  const values: any[] = [];
  const chunks: string[] = [];
  rows.forEach((r, i) => {
    const j = i * 5;
    chunks.push(`($${j + 1},$${j + 2},$${j + 3},$${j + 4},$${j + 5})`);
    values.push(r.date, r.account_id, r.product_code, r.country ?? null, r.price ?? null);
  });
  const sql = `INSERT INTO price_daily(date, account_id, product_code, country, price)
               VALUES ${chunks.join(',')}
               ON CONFLICT (account_id, product_code, date)
               DO UPDATE SET price = EXCLUDED.price, country = COALESCE(EXCLUDED.country, price_daily.country)`;
  const res = await query(sql, values);
  return (res as any).rowCount ?? rows.length;
}

export interface CompetitorPriceDailyRow {
  date: string;
  account_id: string;
  product_code: string;
  country?: string | null;
  competitor_id: string;
  competitor_price?: number | null;
  our_price?: number | null;
}

export async function upsertCompetitorPriceDaily(rows: CompetitorPriceDailyRow[]) {
  if (!rows.length) return 0;
  const values: any[] = [];
  const chunks: string[] = [];
  rows.forEach((r, i) => {
    const j = i * 7;
    chunks.push(`($${j + 1},$${j + 2},$${j + 3},$${j + 4},$${j + 5},$${j + 6},$${j + 7})`);
    values.push(r.date, r.account_id, r.product_code, r.country ?? null, r.competitor_id, r.competitor_price ?? null, r.our_price ?? null);
  });
  const sql = `INSERT INTO competitor_price_daily(date, account_id, product_code, country, competitor_id, competitor_price, our_price)
               VALUES ${chunks.join(',')}
               ON CONFLICT (account_id, product_code, competitor_id, date)
               DO UPDATE SET competitor_price = EXCLUDED.competitor_price, our_price = EXCLUDED.our_price`;
  const res = await query(sql, values);
  return (res as any).rowCount ?? rows.length;
}

export interface TrendsDailyRow { keyword: string; country: string; date: string; score: number; account_id?: string }

export async function upsertGoogleTrendsDaily(rows: TrendsDailyRow[]) {
  if (!rows.length) return 0;
  const values: any[] = [];
  const chunks: string[] = [];
  rows.forEach((r, i) => {
    const j = i * 4;
    chunks.push(`($${j + 1},$${j + 2},$${j + 3},$${j + 4})`);
    values.push(r.keyword, r.country, r.date, r.score);
  });
  const sql = `INSERT INTO google_trends_daily(keyword, country, date, score)
               VALUES ${chunks.join(',')}
               ON CONFLICT (keyword, date, country)
               DO UPDATE SET score = EXCLUDED.score`;
  const res = await query(sql, values);
  return (res as any).rowCount ?? rows.length;
}

export interface WeatherDailyRow { date: string; country: string; city: string; temp_avg_c?: number|null; rain_mm?: number|null; wind_kmh?: number|null }

export async function upsertWeatherDaily(rows: WeatherDailyRow[]) {
  if (!rows.length) return 0;
  const values: any[] = [];
  const chunks: string[] = [];
  rows.forEach((r, i) => {
    const j = i * 6;
    chunks.push(`($${j + 1},$${j + 2},$${j + 3},$${j + 4},$${j + 5},$${j + 6})`);
    values.push(r.date, r.country, r.city, r.temp_avg_c ?? null, r.rain_mm ?? null, r.wind_kmh ?? null);
  });
  const sql = `INSERT INTO weather_daily(date, country, city, temp_avg_c, rain_mm, wind_kmh)
               VALUES ${chunks.join(',')}
               ON CONFLICT (date, country, city)
               DO UPDATE SET temp_avg_c = EXCLUDED.temp_avg_c, rain_mm = EXCLUDED.rain_mm, wind_kmh = EXCLUDED.wind_kmh`;
  const res = await query(sql, values);
  return (res as any).rowCount ?? rows.length;
}
