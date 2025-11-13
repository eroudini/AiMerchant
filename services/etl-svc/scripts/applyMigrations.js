import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const dsn = process.env.DATABASE_URL || process.env.ANALYTICS_DATABASE_URL;
  if (!dsn) {
    console.error('ERROR: DATABASE_URL (or ANALYTICS_DATABASE_URL) is required');
    process.exit(1);
  }
  const pool = new Pool({ connectionString: dsn });
  const client = await pool.connect();
  try {
    console.log('Connected to DB');
  const migPath = path.resolve(__dirname, '../../../db/migrations/202511131600_add_core_analytics_tables.sql');
    if (!fs.existsSync(migPath)) {
      throw new Error(`Migration file not found: ${migPath}`);
    }
    const sql = fs.readFileSync(migPath, 'utf-8');
    console.log('Applying migration 202511131600_add_core_analytics_tables.sql ...');
    await client.query(sql);
    console.log('Migration applied');

    // Minimal seed for MOCK ETL
    const accountId = process.env.ACCOUNT_ID || 'acc-1';
    const productCode = process.env.PRODUCT_CODE || 'SKU1';
    await client.query(
      `INSERT INTO account(id, name) VALUES ($1, $2)
       ON CONFLICT (id) DO NOTHING`,
      [accountId, 'Demo Account']
    );
    await client.query(
      `INSERT INTO product(account_id, product_code, name, category) VALUES ($1, $2, $3, $4)
       ON CONFLICT (account_id, product_code) DO NOTHING`,
      [accountId, productCode, 'Produit Démo', 'Cat']
    );
    console.log(`Seeded account=${accountId}, product=${productCode}`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});
