import argparse
import os
import json
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Tuple, List

import numpy as np
import pandas as pd
from joblib import dump
from pydantic import BaseModel
from tqdm import tqdm
import holidays
from dataclasses import dataclass


class TrainConfig(BaseModel):
    product_id: Optional[int] = None
    country: str
    channel: Optional[str] = None
    horizon: int = 30
    target_col: str = "sales"
    date_col: str = "date"
    price_col: Optional[str] = "price"
    stock_col: Optional[str] = "stock"
    exog_prefix: str = "exog_"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    dsn: Optional[str] = None
    from_csv: Optional[str] = None
    output_dir: str = "forecasting/artifacts"


@dataclass
class BacktestMetrics:
    mape: float
    wmape: float
    mae: float
    samples: int


def load_from_db(cfg: TrainConfig) -> pd.DataFrame:
    assert cfg.dsn, "DSN requis pour la lecture en base"
    # Lazy import to avoid hard dependency when using CSV mode
    import psycopg2  # type: ignore
    from psycopg2.extras import RealDictCursor  # type: ignore
    query = f"""
        with daily as (
            select
                d::date as date,
                coalesce(sum(s.quantity), 0) as sales,
                avg(s.price) as price,
                max(s.stock) as stock
            from generate_series(date %(start)s, date %(end)s, interval '1 day') as gs(d)
            left join internal_sales s
              on s.product_id = %(pid)s
             and s.country = %(country)s
             and s.channel = %(channel)s
             and date(s.ts) = gs.d
            group by 1
            order by 1
        )
        select * from daily;
    """
    params = {
        "pid": cfg.product_id,
        "country": cfg.country,
        "channel": cfg.channel or "GLOBAL",
        "start": cfg.start_date or (datetime.utcnow() - timedelta(days=365*2)).date(),
        "end": cfg.end_date or (datetime.utcnow() - timedelta(days=1)).date(),
    }
    with psycopg2.connect(cfg.dsn, cursor_factory=RealDictCursor) as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall()
            df = pd.DataFrame(rows)
    return df


def load_from_csv(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    return df


def ensure_daily_index(df: pd.DataFrame, date_col: str, target_col: str) -> pd.DataFrame:
    df = df.copy()
    df[date_col] = pd.to_datetime(df[date_col]).dt.tz_localize(None)
    df = df.sort_values(date_col)
    idx = pd.date_range(df[date_col].min(), df[date_col].max(), freq="D")
    df = df.set_index(date_col).reindex(idx).rename_axis(date_col).reset_index()
    # Fill target with 0 if missing days
    if target_col in df.columns:
        df[target_col] = df[target_col].fillna(0)
    # Forward fill continuous vars
    for col in [c for c in df.columns if c not in [date_col, target_col]]:
        df[col] = df[col].ffill()
    return df


def add_holiday_dummy(df: pd.DataFrame, date_col: str, country: str) -> pd.DataFrame:
    df = df.copy()
    country_code = country.upper()
    try:
        country_holidays = holidays.country_holidays(country_code)
    except Exception:
        country_holidays = {}
    df["exog_holiday"] = df[date_col].dt.date.apply(lambda d: 1 if d in country_holidays else 0)
    return df


def build_exog_matrix(df: pd.DataFrame, cfg: TrainConfig) -> Tuple[pd.DataFrame, List[str]]:
    exog_cols: List[str] = []
    # Use explicit exog_* columns
    exog_cols += [c for c in df.columns if c.startswith(cfg.exog_prefix)]
    # Include price and stock if present
    if cfg.price_col and cfg.price_col in df.columns:
        exog_cols.append(cfg.price_col)
    if cfg.stock_col and cfg.stock_col in df.columns:
        exog_cols.append(cfg.stock_col)
    X = df[exog_cols].astype(float) if exog_cols else None
    return X, exog_cols


def wmape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    denom = np.sum(np.abs(y_true)) + 1e-8
    return float(np.sum(np.abs(y_true - y_pred)) / denom)


def build_design_matrix(df: pd.DataFrame, cfg: TrainConfig, include_target: bool = True) -> Tuple[np.ndarray, Optional[np.ndarray], List[str]]:
    """Build a linear regression design matrix with weekly seasonality (weekday one-hot) + exogenous."""
    X_parts = []
    feature_names = []
    # Intercept
    X_parts.append(np.ones((len(df), 1)))
    feature_names.append('bias')
    # Weekday one-hot (0-6)
    weekday = pd.to_datetime(df[cfg.date_col]).dt.weekday.values
    for d in range(7):
        col = (weekday == d).astype(float)[:, None]
        X_parts.append(col)
        feature_names.append(f'wd_{d}')
    # Exogenous numeric columns
    exog_cols = [c for c in df.columns if c.startswith(cfg.exog_prefix)]
    for colname in [cfg.price_col, cfg.stock_col]:
        if colname and colname in df.columns:
            exog_cols.append(colname)
    for c in exog_cols:
        vals = pd.to_numeric(df[c], errors='coerce').fillna(method='ffill').fillna(0.0).values[:, None]
        X_parts.append(vals)
        feature_names.append(c)
    # Holiday dummy
    if 'exog_holiday' in df.columns:
        X_parts.append(df['exog_holiday'].astype(float).values[:, None])
        feature_names.append('exog_holiday')
    X = np.hstack(X_parts)
    y = df[cfg.target_col].astype(float).values if include_target and (cfg.target_col in df.columns) else None
    return X, y, feature_names


def fit_linear(X: np.ndarray, y: np.ndarray, l2: float = 1e-3) -> Tuple[np.ndarray, float]:
    """Ridge-regularized least squares using normal equations with small l2."""
    # (X^T X + l2 I)^{-1} X^T y
    XtX = X.T @ X
    XtX += l2 * np.eye(X.shape[1])
    Xty = X.T @ y
    coef = np.linalg.solve(XtX, Xty)
    residuals = y - (X @ coef)
    sigma = float(np.std(residuals))
    return coef, sigma


def predict_linear(X: np.ndarray, coef: np.ndarray) -> np.ndarray:
    return X @ coef


def rolling_backtest_linear(df: pd.DataFrame, cfg: TrainConfig, splits: int = 3, horizon: int = 14) -> BacktestMetrics:
    n = len(df)
    fold_size = max(horizon, n // (splits + 1))
    starts = [n - (i+1) * fold_size for i in range(splits)][::-1]
    maes, mapes, wmapes = [], [], []
    for start in starts:
        train_df = df.iloc[:start]
        test_df = df.iloc[start:start+horizon]
        X_train, y_train, _ = build_design_matrix(train_df, cfg)
        coef, _ = fit_linear(X_train, y_train)
        X_test, y_test, _ = build_design_matrix(test_df, cfg)
        yhat = predict_linear(X_test, coef)
        y = y_test
        maes.append(float(np.mean(np.abs(y - yhat))))
        mape_i = float(np.mean(np.abs((y - yhat) / np.clip(np.abs(y), 1e-6, None))))
        mapes.append(mape_i)
        wmapes.append(wmape(y, yhat))
    return BacktestMetrics(mape=float(np.mean(mapes)), wmape=float(np.mean(wmapes)), mae=float(np.mean(maes)), samples=int(splits))


def train_and_forecast(df: pd.DataFrame, cfg: TrainConfig) -> dict:
    df = ensure_daily_index(df, cfg.date_col, cfg.target_col)
    df = add_holiday_dummy(df, cfg.date_col, cfg.country)
    # Backtest
    metrics = rolling_backtest_linear(df, cfg, splits=3, horizon=min(14, cfg.horizon))
    # Fit final linear model
    X, y, feature_names = build_design_matrix(df, cfg)
    coef, sigma = fit_linear(X, y)
    # Future exog
    last_date = pd.to_datetime(df[cfg.date_col]).max()
    future_idx = pd.date_range(last_date + pd.Timedelta(days=1), periods=cfg.horizon, freq='D')
    future_df = pd.DataFrame({cfg.date_col: future_idx})
    # Carry last known values for exog cols
    carry_cols = [c for c in df.columns if c.startswith(cfg.exog_prefix)]
    for colname in [cfg.price_col, cfg.stock_col]:
        if colname and colname in df.columns:
            carry_cols.append(colname)
    for c in carry_cols:
        future_df[c] = df[c].iloc[-1]
    # Holidays
    future_df = add_holiday_dummy(future_df, cfg.date_col, cfg.country)
    X_future, _, _ = build_design_matrix(pd.concat([df.iloc[[-1]].copy(), future_df], ignore_index=True), cfg, include_target=False)
    X_future = X_future[1:1+cfg.horizon]
    yhat = predict_linear(X_future, coef)
    z = 1.2816  # ~ p10/p90 for N(0,1)
    p10 = yhat - z * sigma
    p90 = yhat + z * sigma
    out = pd.DataFrame({cfg.date_col: future_idx, 'yhat': yhat, 'p10': p10, 'p90': p90})
    return {
        'forecast': out,
        'metrics': asdict(metrics),
        'model_summary': f'Linear model with features: {feature_names}',
        'features': feature_names,
        'coef': coef.tolist(),
        'sigma': sigma,
        'endog_len': int(len(y)),
    }


def save_artifacts(result: dict, cfg: TrainConfig, model_obj, key: str) -> Path:
    ts = datetime.utcnow().strftime('%Y%m%dT%H%M%S')
    outdir = Path(cfg.output_dir) / key / ts
    outdir.mkdir(parents=True, exist_ok=True)
    # Save forecast CSV
    result['forecast'].to_csv(outdir / 'forecast.csv', index=False)
    # Save metadata
    meta = {
        'config': json.loads(cfg.model_dump_json()),
        'metrics': result['metrics'],
        'features': result.get('features', []),
        'endog_len': result['endog_len'],
        'createdAt': ts,
    }
    (outdir / 'metadata.json').write_text(json.dumps(meta, indent=2), encoding='utf-8')
    # Save model (coefficients + feature names)
    model_payload = {
        'features': result['features'],
        'coef': result['coef'],
        'sigma': result['sigma'],
    }
    dump(model_payload, outdir / 'model.joblib')
    # Save summary
    (outdir / 'model_summary.txt').write_text(result['model_summary'], encoding='utf-8')
    return outdir


def main():
    ap = argparse.ArgumentParser(description='Train SARIMAX forecast with exogenous features')
    ap.add_argument('--product-id', type=int)
    ap.add_argument('--country', type=str, required=True)
    ap.add_argument('--channel', type=str, default='GLOBAL')
    ap.add_argument('--horizon', type=int, default=30)
    ap.add_argument('--target-col', type=str, default='sales')
    ap.add_argument('--date-col', type=str, default='date')
    ap.add_argument('--start-date', type=str)
    ap.add_argument('--end-date', type=str)
    ap.add_argument('--dsn', type=str, default=os.getenv('DATABASE_URL'))
    ap.add_argument('--from-csv', type=str)
    ap.add_argument('--output-dir', type=str, default='forecasting/artifacts')
    args = ap.parse_args()

    cfg = TrainConfig(
        product_id=args.product_id,
        country=args.country,
        channel=args.channel,
        horizon=args.horizon,
        target_col=args.target_col,
        date_col=args.date_col,
        start_date=args.start_date,
        end_date=args.end_date,
        dsn=args.dsn,
        from_csv=args.from_csv,
        output_dir=args.output_dir,
    )

    if cfg.from_csv:
        df = load_from_csv(cfg.from_csv)
    else:
        if not cfg.product_id:
            raise SystemExit('product-id requis si pas de --from-csv')
        if not cfg.dsn:
            raise SystemExit('DATABASE_URL/--dsn requis pour lecture Postgres')
        df = load_from_db(cfg)

    # Train and forecast
    train_df = df.copy()
    result = train_and_forecast(train_df, cfg)

    key = f"p{cfg.product_id or 'csv'}_{cfg.country}_{cfg.channel}"
    outdir = save_artifacts(result, cfg, None, key)
    print(f"Saved artifacts to: {outdir}")


if __name__ == '__main__':
    main()
