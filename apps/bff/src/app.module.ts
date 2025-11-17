import { Module } from '@nestjs/common';
import { ForecastModule } from './forecast/forecast.module.js';
import { ActionsModule } from './actions/actions.module.js';
import { HealthController } from './health.controller.js';
import { SchedulerModule } from './scheduler/scheduler.module.js';

@Module({
  imports: [ForecastModule, ActionsModule, SchedulerModule],
  controllers: [HealthController],
})
export class AppModule {}
