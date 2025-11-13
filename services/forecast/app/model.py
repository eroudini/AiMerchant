from __future__ import annotations
from dataclasses import dataclass
from typing import Tuple, List, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os
import psycopg


@dataclass
class ForecastResult:
    dates: List[pd.Timestamp]
    yhat: np.ndarray
    p10: np.ndarray
    p90: np.ndarray
    sigma: float


async def load_sales_daily(conn: psycopg.AsyncConnection, account_id: str, product_id: str, country: Optional[str] = None, days: int = 730) -> pd.DataFrame:
    since = (datetime.utcnow().date() - timedelta(days=days)).isoformat()
    where_country = " AND country = %(country)s" if country else ""
    rows = []
    async with conn.cursor() as cur:
        await cur.execute(
            f"""
            SELECT date, COALESCE(units_sold, 0) as units_sold
            FROM sales_daily
            WHERE account_id = %(account_id)s
              AND product_code = %(product_id)s
              AND date >= %(since)s
              {where_country}
            ORDER BY date
            """,
            {"account_id": account_id, "product_id": product_id, "since": since, "country": country},
        )
        async for rec in cur:
            rows.append({"date": rec[0], "units_sold": float(rec[1] or 0.0)})
    if not rows:
        # Return empty daily frame
        idx = pd.date_range(end=datetime.utcnow().date(), periods=30, freq="D")
        return pd.DataFrame({"date": idx, "units_sold": [0.0] * len(idx)})
    df = pd.DataFrame(rows)
    df["date"] = pd.to_datetime(df["date"])  # naive date
    # Ensure no gaps
    idx = pd.date_range(df["date"].min(), df["date"].max(), freq="D")
    df = df.set_index("date").reindex(idx).rename_axis("date").reset_index()
    df["units_sold"] = df["units_sold"].fillna(0.0)
    return df


def _design_matrix(df: pd.DataFrame) -> Tuple[np.ndarray, List[str]]:
    n = len(df)
    ones = np.ones((n, 1))
    weekday = pd.to_datetime(df["date"]).dt.weekday.values
    xs = [ones]
    names = ["bias"]
    for d in range(7):
        xs.append((weekday == d).astype(float)[:, None])
        names.append(f"wd_{d}")
    X = np.hstack(xs)
    return X, names


def _ridge_fit(X: np.ndarray, y: np.ndarray, l2: float = 1e-3) -> Tuple[np.ndarray, float]:
    XtX = X.T @ X + l2 * np.eye(X.shape[1])
    coef = np.linalg.solve(XtX, X.T @ y)
    resid = y - (X @ coef)
    sigma = float(np.std(resid))
    return coef, sigma


def _predict(X: np.ndarray, coef: np.ndarray) -> np.ndarray:
    return X @ coef


def simple_forecast(df: pd.DataFrame, horizon: int = 30) -> ForecastResult:
    df = df.copy()
    X, _ = _design_matrix(df)
    y = df["units_sold"].astype(float).values
    coef, sigma = _ridge_fit(X, y)
    # Build future design matrix
    last_date = pd.to_datetime(df["date"]).max()
    future_idx = pd.date_range(last_date + pd.Timedelta(days=1), periods=horizon, freq="D")
    future_df = pd.DataFrame({"date": future_idx})
    Xf, _ = _design_matrix(pd.concat([df.iloc[[-1]], future_df], ignore_index=True))
    Xf = Xf[1:1 + horizon]
    yhat = _predict(Xf, coef)
    z = 1.2816  # ~ p10/p90
    p10 = yhat - z * sigma
    p90 = yhat + z * sigma
    return ForecastResult(dates=list(future_idx), yhat=yhat, p10=p10, p90=p90, sigma=sigma)


async def write_forecast(conn: psycopg.AsyncConnection, account_id: str, product_id: str, country: Optional[str], res: ForecastResult, run_id: str):
    # Upsert into forecast_product_daily
    rows = [(
        d.date(), account_id, product_id, country, float(res.yhat[i]), float(res.p10[i]), float(res.p90[i]), run_id
    ) for i, d in enumerate(res.dates)]
    async with conn.cursor() as cur:
        await cur.executemany(
            """
            INSERT INTO forecast_product_daily(date, account_id, product_code, country, yhat, p10, p90, run_id)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (account_id, product_code, date)
            DO UPDATE SET yhat=EXCLUDED.yhat, p10=EXCLUDED.p10, p90=EXCLUDED.p90, country=COALESCE(EXCLUDED.country, forecast_product_daily.country), run_id=EXCLUDED.run_id
            """,
            rows
        )


def get_dsn() -> str:
    dsn = os.getenv("DATABASE_URL") or os.getenv("ANALYTICS_DATABASE_URL")
    if not dsn:
        raise RuntimeError("DATABASE_URL or ANALYTICS_DATABASE_URL is required for forecast service")
    return dsn

# --- Synchronous variants for Windows compatibility ---
def load_sales_daily_sync(conn: psycopg.Connection, account_id: str, product_id: str, country: Optional[str] = None, days: int = 730) -> pd.DataFrame:
    since = (datetime.utcnow().date() - timedelta(days=days)).isoformat()
    where_country = " AND country = %(country)s" if country else ""
    rows = []
    with conn.cursor() as cur:
        cur.execute(
            f"""
            SELECT date, COALESCE(units_sold, 0) as units_sold
            FROM sales_daily
            WHERE account_id = %(account_id)s
              AND product_code = %(product_id)s
              AND date >= %(since)s
              {where_country}
            ORDER BY date
            """,
            {"account_id": account_id, "product_id": product_id, "since": since, "country": country},
        )
        for rec in cur:
            rows.append({"date": rec[0], "units_sold": float(rec[1] or 0.0)})
    if not rows:
        idx = pd.date_range(end=datetime.utcnow().date(), periods=30, freq="D")
        return pd.DataFrame({"date": idx, "units_sold": [0.0] * len(idx)})
    df = pd.DataFrame(rows)
    df["date"] = pd.to_datetime(df["date"])  # naive date
    idx = pd.date_range(df["date"].min(), df["date"].max(), freq="D")
    df = df.set_index("date").reindex(idx).rename_axis("date").reset_index()
    df["units_sold"] = df["units_sold"].fillna(0.0)
    return df

def write_forecast_sync(conn: psycopg.Connection, account_id: str, product_id: str, country: Optional[str], res: ForecastResult, run_id: str):
    rows = [(
        d.date(), account_id, product_id, country, float(res.yhat[i]), float(res.p10[i]), float(res.p90[i]), run_id
    ) for i, d in enumerate(res.dates)]
    with conn.cursor() as cur:
        cur.executemany(
            """
            INSERT INTO forecast_product_daily(date, account_id, product_code, country, yhat, p10, p90, run_id)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (account_id, product_code, date)
            DO UPDATE SET yhat=EXCLUDED.yhat, p10=EXCLUDED.p10, p90=EXCLUDED.p90, country=COALESCE(EXCLUDED.country, forecast_product_daily.country), run_id=EXCLUDED.run_id
            """,
            rows
        )
    conn.commit()
