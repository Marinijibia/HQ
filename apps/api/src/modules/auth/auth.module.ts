import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { EntitlementGuard } from './entitlement.guard';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [UserModule],
  providers: [FirebaseService, AuthGuard, RolesGuard, EntitlementGuard],
  exports: [FirebaseService, AuthGuard, RolesGuard, EntitlementGuard],
})
export class AuthModule {}
