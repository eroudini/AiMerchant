import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // Allow local Next.js (http://localhost:3000) to call the BFF in dev
  app.enableCors({ origin: true, credentials: false });
  const port = Number(process.env.BFF_PORT || 4200);
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`BFF listening on 0.0.0.0:${port}`);
}
bootstrap();
