import pandas as pd
from app.model import simple_forecast


def test_simple_forecast_shapes():
    dates = pd.date_range('2025-01-01', periods=60, freq='D')
    df = pd.DataFrame({'date': dates, 'units_sold': [i % 5 for i in range(60)]})
    res = simple_forecast(df, horizon=10)
    assert len(res.dates) == 10
    assert len(res.yhat) == 10
    assert len(res.p10) == 10
    assert len(res.p90) == 10
