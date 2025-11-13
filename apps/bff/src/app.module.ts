import { Module } from '@nestjs/common';
import { ForecastModule } from './forecast/forecast.module.js';

@Module({
  imports: [ForecastModule],
})
export class AppModule {}
