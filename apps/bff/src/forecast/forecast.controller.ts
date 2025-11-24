import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ForecastService } from './forecast.service.js';
import { ForecastOverviewQuery, ForecastRecomputeBody, ForecastOverviewResponse } from './forecast.dto.js';

@Controller('forecast')
export class ForecastController {
  constructor(private readonly svc: ForecastService) {}

  @Get('overview')
  async overview(@Query() query: ForecastOverviewQuery, @Req() req: any): Promise<ForecastOverviewResponse> {
    const accountId = (req.user?.accountId) || (req.headers['x-account-id'] as string) || process.env.ACCOUNT_ID;
    return this.svc.getOverview(accountId!, query.period as any, query.country);
  }

  @Post('recompute')
  async recompute(@Body() body: ForecastRecomputeBody, @Req() req: any) {
    const accountId = (req.user?.accountId) || (req.headers['x-account-id'] as string) || process.env.ACCOUNT_ID;
    return this.svc.recomputeForecast(accountId!, body.product_ids, body.horizon_days);
  }
}
