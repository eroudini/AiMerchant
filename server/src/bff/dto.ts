import { IsEnum, IsIn, IsISO8601, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class OverviewQueryDto {
  @IsEnum({ last_7d: 'last_7d', last_30d: 'last_30d', last_90d: 'last_90d' })
  period!: 'last_7d' | 'last_30d' | 'last_90d';

  @IsString()
  @IsOptional()
  country?: string;
}

export class ProductTimeseriesParamsDto {
  @IsString()
  id!: string; // product_code
}

export class ProductTimeseriesQueryDto {
  @IsString()
  @Matches(/^(sales|price|stock)(,(sales|price|stock))*$/)
  metrics!: string; // comma-separated

  @IsISO8601()
  from!: string;

  @IsISO8601()
  to!: string;

  @IsOptional()
  @IsIn(['day', 'hour'])
  granularity?: 'day' | 'hour';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @IsOptional()
  @Matches(/^\d+$/)
  limit?: string; // parsed to number
}

export class CompetitorsDiffQueryDto {
  @IsEnum({ last_7d: 'last_7d', last_30d: 'last_30d', last_90d: 'last_90d' })
  period!: 'last_7d' | 'last_30d' | 'last_90d';

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  category?: string;
}

export class MarketHeatmapQueryDto {
  @IsEnum({ last_7d: 'last_7d' })
  period!: 'last_7d';

  @IsString()
  @IsOptional()
  country?: string;
}

export class AlertsMovementsQueryDto {
  @IsEnum({ last_7d: 'last_7d' })
  period!: 'last_7d';

  @IsString()
  @IsOptional()
  country?: string;

  // comma separated: price,stock
  @IsOptional()
  @Matches(/^(price|stock)(,(price|stock))*$/)
  types?: string;

  // percentage threshold as integer string
  @IsOptional()
  @Matches(/^\d+$/)
  threshold?: string;

  // max items
  @IsOptional()
  @Matches(/^\d+$/)
  limit?: string;
}

export class PricingSimulateQueryDto {
  @IsString()
  sku!: string; // product_code

  // delta percentage, e.g., -5 or 10
  @Matches(/^-?\d+(\.\d+)?$/)
  delta!: string;

  @IsString()
  @IsOptional()
  country?: string;
}

export class PricingSuggestQueryDto {
  @IsString()
  sku!: string;

  // target margin between 0 and 1
  @Matches(/^0(\.\d+)?|1(\.0+)?$/)
  target!: string;

  // optional clamp around competitor price (e.g., 0.05 for +/-5%)
  @IsOptional()
  @Matches(/^0(\.\d+)?|1(\.0+)?$/)
  clamp?: string;

  // costs if not retrievable server-side
  @Matches(/^\d+(\.\d+)?$/)
  buy!: string;

  @Matches(/^\d+(\.\d+)?$/)
  fees!: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class PricingApplyBodyDto {
  @IsString()
  sku!: string;

  @Matches(/^\d+(\.\d+)?$/)
  new_price!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class StockPredictQueryDto {
  @IsString()
  product!: string; // product_code

  @IsOptional()
  @Matches(/^\d+$/)
  lead_days?: string; // optional lead time in days

  @IsString()
  @IsOptional()
  country?: string;
}

export class ProductRadarTrendsQueryDto {
  @IsEnum({ last_30d: 'last_30d', last_90d: 'last_90d' })
  period!: 'last_30d' | 'last_90d';

  @IsOptional()
  @IsIn(['category','product'])
  type?: 'category' | 'product';

  @IsString()
  @IsOptional()
  country?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  limit?: string;
}

export class ExportCsvQueryDto {
  @IsIn(['radar_trends','market_heatmap','competitors_diff','alerts_movements','forecast_demand','forecast_surge'])
  resource!: 'radar_trends'|'market_heatmap'|'competitors_diff'|'alerts_movements'|'forecast_demand'|'forecast_surge';

  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsIn(['category','product'])
  type?: 'category'|'product';

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  limit?: string;

  @IsOptional()
  @Matches(/^(price|stock)(,(price|stock))*$/)
  types?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  threshold?: string;

  @IsOptional()
  @IsString()
  category?: string;

  // Forecast-specific filters
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  horizon?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  window?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  top?: string;
}

export class ForecastDemandQueryDto {
  @IsString()
  productId!: string; // product_code or 'csv' for sample

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  horizon?: string; // days
}

export class ForecastImportArtifactsBodyDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  horizon?: string;
}

export class ForecastSurgeQueryDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  window?: string; // nombre de jours à analyser (ex: 14)

  @IsOptional()
  @Matches(/^\d+$/)
  top?: string; // top N jours par surge
}

export class OpportunitiesGainersQueryDto {
  @IsEnum({ last_7d: 'last_7d', last_30d: 'last_30d' })
  period!: 'last_7d' | 'last_30d';

  @IsString()
  @IsOptional()
  country?: string;

  @IsOptional()
  @Matches(/^\d+$/)
  limit?: string; // max rows

  // sort by: growth (default) or revenue
  @IsOptional()
  @IsIn(['growth','revenue'])
  sort?: 'growth'|'revenue';
}

export class ActionPoBodyDto {
  @IsString()
  productId!: string; // internal Product.id or product_code mapping

  @Matches(/^\d+$/)
  qty!: string; // integer quantity

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ActionPriceBodyDto {
  @IsString()
  productId!: string;

  @Matches(/^\d+(\.\d+)?$/)
  new_price!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
