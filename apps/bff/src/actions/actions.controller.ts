import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ActionsService } from './actions.service.js';
import { ExecuteActionsBody, GenerateRecommendationsBody, ListRecommendationsQuery, RecommendationRow } from './actions.dto.js';

@Controller('actions')
export class ActionsController {
  constructor(private readonly svc: ActionsService) {}

  @Post('recommendations/generate')
  async generate(@Body() body: GenerateRecommendationsBody, @Req() req: any) {
    const accountId = (req.user?.accountId) || (req.headers['x-account-id'] as string) || process.env.ACCOUNT_ID;
    return this.svc.generateRecommendations(accountId!, body);
  }

  @Get('recommendations')
  async list(@Query() query: ListRecommendationsQuery, @Req() req: any): Promise<RecommendationRow[]> {
    const accountId = (req.user?.accountId) || (req.headers['x-account-id'] as string) || process.env.ACCOUNT_ID;
    return this.svc.listRecommendations(accountId!, query);
  }

  @Post('execute')
  async execute(@Body() body: ExecuteActionsBody, @Req() req: any) {
    const accountId = (req.user?.accountId) || (req.headers['x-account-id'] as string) || process.env.ACCOUNT_ID;
    return this.svc.execute(accountId!, body);
  }
}
