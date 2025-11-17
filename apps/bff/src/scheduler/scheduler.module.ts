import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReplenishmentJob } from './tasks/replenishment.job.js';
import { ActionsModule } from '../actions/actions.module.js';
import { ForecastModule } from '../forecast/forecast.module.js';
import { AutoActionController } from './autoaction.controller.js';

@Module({
  imports: [ScheduleModule.forRoot(), ActionsModule, ForecastModule],
  providers: [ReplenishmentJob],
  controllers: [AutoActionController],
})
export class SchedulerModule {}
