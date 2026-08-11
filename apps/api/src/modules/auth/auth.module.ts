import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { EntitlementGuard } from './entitlement.guard';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, RolesGuard, EntitlementGuard],
  exports: [AuthService, AuthGuard, RolesGuard, EntitlementGuard],
})
export class AuthModule {}
