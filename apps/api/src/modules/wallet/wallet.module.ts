import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { CircleClientService } from './circle-client.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, CircleClientService],
  exports: [WalletService, CircleClientService],
})
export class WalletModule {}
