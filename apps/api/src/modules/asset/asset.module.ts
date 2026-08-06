import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { AssetRepository } from './asset.repository';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AuthModule, DatabaseModule, AiModule],
  controllers: [AssetController],
  providers: [AssetService, AssetRepository],
  exports: [AssetService, AssetRepository],
})
export class AssetModule {}
