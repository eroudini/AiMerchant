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
}
