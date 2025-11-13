# Forecasting — Training Script

This module provides a solid, production‑ready training script to forecast demand with exogenous variables and produce actionable artifacts. It uses a robust linear model with weekly seasonality (one‑hot weekdays) and exogenous regressors (pure NumPy) to avoid compiled deps issues on Windows, and supports:

- Data source: Postgres (via DSN) or CSV
- Features: daily resampling, holiday dummies, moving averages, exogenous regressors
- Rolling backtests: time‑series split, wMAPE/MAE/MAPE
- Forecast outputs: p50 with p10/p90 bands from residual variance (naive Gaussian approx)
- Artifacts: serialized model + metadata + forecast CSV

## Quick start

1) Install dependencies (Python 3.10+ recommended)

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r forecasting/requirements.txt
```

2) Run on a CSV (columns: date,sales,price,stock[,exog_*])

```powershell
python forecasting/train.py --from-csv forecasting/data/example_timeseries.csv --country FR --channel AMAZON --horizon 30 --output-dir forecasting/artifacts
```

3) Or run on Postgres (read DATABASE_URL or pass --dsn)

```powershell
$env:DATABASE_URL = "postgres://user:pass@host:5432/db"
python forecasting/train.py --product-id 123 --country FR --channel AMAZON --horizon 30 --output-dir forecasting/artifacts
```

Artifacts will be saved under forecasting/artifacts/<key>/timestamp/.

## Data contract

- Target column: `sales` (daily units). If your target is revenue, rename to `sales` or adapt `--target-col`.
- Required: `date` (YYYY-MM-DD), `sales`. Optional: `price`, `stock`, any `exog_*` columns.
- Missing days are auto‑filled with zeros for `sales` and forward‑filled for continuous vars.

## Notes

- Baseline léger et robuste sans dépendances compilées (convient à Windows/Python récents). On pourra plugger SARIMAX/Prophet/XGBoost plus tard en conservant le même contrat d’artefacts.
- Jours fériés via `python-holidays` selon `--country`.
- Intervalles p10/p90 basés sur l’écart‑type résiduel (approximation raisonnable pour MVP).