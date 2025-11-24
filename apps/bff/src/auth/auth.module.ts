import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtMiddleware } from './jwt.middleware.js';

@Module({
  providers: [AuthService, JwtMiddleware],
  exports: [AuthService]
})
export class AuthModule {}
