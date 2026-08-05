import { Module } from '@nestjs/common';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';
import { CompanyResearchService } from './company-research.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AuthModule, DatabaseModule, AiModule],
  controllers: [IntelligenceController],
  providers: [IntelligenceService, CompanyResearchService],
  exports: [IntelligenceService, CompanyResearchService],
})
export class IntelligenceModule {}

