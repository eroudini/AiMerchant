import { Client } from 'pg';

async function main() {
  const cfg = {
    host: process.env.PGHOST || '127.0.0.1',
    port: Number(process.env.PGPORT || 5433),
    user: process.env.PGUSER || 'aimerchant',
    password: process.env.PGPASSWORD || 'aimerchant',
    database: process.env.PGDATABASE || 'aimerchant',
  };
  const c = new Client(cfg);
  try {
    await c.connect();
    const r = await c.query('select current_user, current_database()');
    console.log('Connected as', r.rows[0]);
  } catch (e) {
    console.error('CONNECT ERR:', e.message);
    process.exit(1);
  } finally {
    await c.end().catch(()=>{});
  }
}

main();
