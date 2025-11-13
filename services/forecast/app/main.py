from fastapi import FastAPI
from fastapi import Body
from .schemas import ForecastRunRequest, ForecastRunResponse, ForecastProductSummary
from .model import simple_forecast, load_sales_daily, write_forecast, get_dsn, load_sales_daily_sync, write_forecast_sync
import psycopg
import uuid
from typing import List
import sys
import asyncio

# Windows asyncio policy fix for psycopg async
if sys.platform.startswith("win"):
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception:
        pass

app = FastAPI(title="Forecast Service", version="0.1.0")


@app.get("/forecast/sample")
async def forecast_sample():
    return {
        "product_id": "SKU1",
        "horizon_days": 7,
        "series": [{"date": "2025-03-01", "yhat": 10.0, "p10": 8.0, "p90": 12.0} for _ in range(7)]
    }


@app.post("/forecast/run", response_model=ForecastRunResponse)
async def run_forecast(payload: ForecastRunRequest = Body(...)):
    dsn = get_dsn()
    run_id = str(uuid.uuid4())
    summaries: List[ForecastProductSummary] = []
    try:
        # Use sync psycopg on Windows to avoid ProactorEventLoop issues
        if sys.platform.startswith("win"):
            with psycopg.connect(dsn) as conn:
                for pid in payload.product_ids:
                    df = load_sales_daily_sync(conn, payload.account_id, pid, payload.country)
                    res = simple_forecast(df, horizon=payload.horizon_days)
                    write_forecast_sync(conn, payload.account_id, pid, payload.country, res, run_id)
                    summaries.append(ForecastProductSummary(
                        product_id=pid,
                        horizon_days=payload.horizon_days,
                        mean=float(res.yhat.mean()),
                        p10=float(res.p10.min()),
                        p90=float(res.p90.max()),
                    ))
        else:
            async with await psycopg.AsyncConnection.connect(dsn) as conn:
                for pid in payload.product_ids:
                    df = await load_sales_daily(conn, payload.account_id, pid, payload.country)
                    res = simple_forecast(df, horizon=payload.horizon_days)
                    await write_forecast(conn, payload.account_id, pid, payload.country, res, run_id)
                    summaries.append(ForecastProductSummary(
                        product_id=pid,
                        horizon_days=payload.horizon_days,
                        mean=float(res.yhat.mean()),
                        p10=float(res.p10.min()),
                        p90=float(res.p90.max()),
                    ))
    except Exception as e:
        # Basic debug path when DEBUG_API=1: encode error into a synthetic product entry
        import os, traceback
        if os.getenv("DEBUG_API") == "1":
            msg = (str(e) or "error")[:200]
            return {
                "run_id": run_id,
                "products": [
                    {
                        "product_id": f"ERR: {msg}",
                        "horizon_days": 0,
                        "mean": 0.0,
                        "p10": 0.0,
                        "p90": 0.0,
                    }
                ],
            }
        raise
    return ForecastRunResponse(run_id=run_id, products=summaries)
