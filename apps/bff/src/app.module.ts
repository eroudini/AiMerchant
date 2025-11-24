import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ForecastModule } from './forecast/forecast.module.js';
import { ActionsModule } from './actions/actions.module.js';
import { HealthController } from './health.controller.js';
import { SchedulerModule } from './scheduler/scheduler.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtMiddleware } from './auth/jwt.middleware.js';

@Module({
  imports: [ForecastModule, ActionsModule, SchedulerModule, AuthModule],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply JWT middleware to all routes except health
    consumer.apply(JwtMiddleware).exclude('health').forRoutes('*');
  }
}
