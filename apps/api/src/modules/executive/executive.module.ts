import { Module } from '@nestjs/common';
import { ExecutiveController } from './executive.controller';
import { ExecutiveCmsController } from './executive-cms.controller';
import { ExecutiveRepository } from './executive.repository';
import { CeoService } from './ceo.service';
import { CollaborationService } from './collaboration.service';
import { QaService } from './qa.service';
import { WebResearchService } from './web-research.service';
import { ResourceService } from './resource.service';
import { FinanceService } from './finance.service';
import { VectorReindexService } from './vector-reindex.service';
import { AiModule } from '../ai/ai.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [AiModule, DatabaseModule],
  controllers: [ExecutiveController, ExecutiveCmsController],
  providers: [
    ExecutiveRepository,
    CeoService,
    CollaborationService,
    QaService,
    WebResearchService,
    ResourceService,
    FinanceService,
    VectorReindexService,
  ],
  exports: [
    ExecutiveRepository,
    CeoService,
    CollaborationService,
    QaService,
    WebResearchService,
    ResourceService,
    FinanceService,
    VectorReindexService,
  ],
})
export class ExecutiveModule {}
