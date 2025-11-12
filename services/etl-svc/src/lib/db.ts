import { Pool } from 'pg';
import { logger } from './logger.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX || 10),
});

export async function query<T = unknown>(text: string, params: unknown[] = []) {
  const start = Date.now();
  const client = await pool.connect();
  try {
    const res = await client.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug({ text, duration, rowCount: (res as any).rowCount }, 'db.query');
    return res;
  } finally {
    client.release();
  }
}

export async function ensureEtlTables() {
  await query(`
    CREATE SCHEMA IF NOT EXISTS etl;
    CREATE TABLE IF NOT EXISTS etl.watermarks (
      source TEXT NOT NULL,
      table_name TEXT NOT NULL,
      account_id UUID NOT NULL,
      cursor_ts TIMESTAMPTZ NULL,
      cursor_id TEXT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (source, table_name, account_id)
    );

    CREATE TABLE IF NOT EXISTS etl.runs (
      id BIGSERIAL PRIMARY KEY,
      source TEXT NOT NULL,
      pipeline TEXT NOT NULL,
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      finished_at TIMESTAMPTZ NULL,
      status TEXT NOT NULL DEFAULT 'running',
      rows_processed BIGINT NOT NULL DEFAULT 0,
      error TEXT NULL
    );
  `);
}

export async function upsertWatermark(
  source: string,
  table: string,
  accountId: string,
  wm: { cursor_ts?: string; cursor_id?: string }
) {
  await query(
    `INSERT INTO etl.watermarks (source, table_name, account_id, cursor_ts, cursor_id)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (source, table_name, account_id)
     DO UPDATE SET cursor_ts = EXCLUDED.cursor_ts, cursor_id = EXCLUDED.cursor_id, updated_at = now()`,
    [source, table, accountId, wm.cursor_ts ?? null, wm.cursor_id ?? null]
  );
}

export async function getWatermark(source: string, table: string, accountId: string) {
  const res = await query<{ cursor_ts: string | null; cursor_id: string | null }>(
    `SELECT cursor_ts, cursor_id FROM etl.watermarks WHERE source=$1 AND table_name=$2 AND account_id=$3`,
    [source, table, accountId]
  );
  return res.rows[0] || null;
}

export async function withRun<T>(source: string, pipeline: string, fn: () => Promise<T>) {
  const startRes = await query<{ id: number }>(
    `INSERT INTO etl.runs(source, pipeline) VALUES ($1,$2) RETURNING id`,
    [source, pipeline]
  );
  const runId = (startRes.rows[0] as any).id as number;
  try {
    const result = await fn();
    await query(`UPDATE etl.runs SET finished_at = now(), status='success' WHERE id=$1`, [runId]);
    return result;
  } catch (err: any) {
    await query(`UPDATE etl.runs SET finished_at = now(), status='error', error=$2 WHERE id=$1`, [runId, String(err?.stack || err)]);
    throw err;
  }
}
