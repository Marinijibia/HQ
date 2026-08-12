import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { AdminBillingController } from './admin-billing.controller';
import { DatabaseModule } from '../database/database.module';
import { EmailModule } from '../email/email.module';
import { CircleClientService } from '../wallet/circle-client.service';

@Module({
  imports: [DatabaseModule, EmailModule],
  controllers: [BillingController, AdminBillingController],
  providers: [BillingService, CircleClientService],
  exports: [BillingService],
})
export class BillingModule {}
