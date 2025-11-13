from pydantic import BaseModel, Field
from typing import List, Optional


class ForecastRunRequest(BaseModel):
    account_id: str
    product_ids: List[str]
    horizon_days: int = Field(30, ge=1, le=90)
    country: Optional[str] = None


class ForecastProductSummary(BaseModel):
    product_id: str
    horizon_days: int
    mean: float
    p10: float
    p90: float


class ForecastRunResponse(BaseModel):
    run_id: str
    products: List[ForecastProductSummary]
