import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { EntitlementGuard } from './entitlement.guard';

@Global()
@Module({
  controllers: [AuthController],
  providers: [FirebaseService, AuthService, AuthGuard, RolesGuard, EntitlementGuard],
  exports: [FirebaseService, AuthService, AuthGuard, RolesGuard, EntitlementGuard],
})
export class AuthModule {}
