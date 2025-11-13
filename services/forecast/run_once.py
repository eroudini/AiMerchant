import asyncio
import sys
import os
import uuid
from app.model import load_sales_daily, simple_forecast, write_forecast, get_dsn
import psycopg

async def main():
    dsn = get_dsn()
    account_id = os.getenv('ACCOUNT_ID', 'acc-1')
    product_id = os.getenv('PRODUCT_ID', 'SKU1')
    country = os.getenv('COUNTRY', 'FR')
    run_id = str(uuid.uuid4())
    async with await psycopg.AsyncConnection.connect(dsn) as conn:
        df = await load_sales_daily(conn, account_id, product_id, country)
        print('Loaded rows:', len(df))
        res = simple_forecast(df, horizon=7)
        await write_forecast(conn, account_id, product_id, country, res, run_id)
        print('Wrote forecast for run_id', run_id)

if __name__ == '__main__':
    if sys.platform.startswith('win'):
        try:
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        except Exception:
            pass
    asyncio.run(main())
