import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

export class ForecastOverviewQuery {
  @IsString()
  @IsIn(['last_7d', 'last_30d', 'last_90d'])
  period!: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class ForecastRecomputeBody {
  @IsArray()
  @IsString({ each: true })
  product_ids!: string[];

  @IsInt()
  @Min(1)
  @Max(90)
  horizon_days = 30;
}

export interface ForecastProductItem {
  product_id: string;
  growth_7d?: number;
  growth_30d?: number;
  forecast_mean?: number;
}

export interface ForecastOverviewResponse {
  top_gainers: ForecastProductItem[];
  top_losers: ForecastProductItem[];
  aggregates: { total_products: number; total_units_30d: number };
}
