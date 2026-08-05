import { Module } from '@nestjs/common';
import { ExecutiveController } from './executive.controller';
import { ExecutiveCmsController } from './executive-cms.controller';
import { ExecutiveRepository } from './executive.repository';
import { CeoService } from './ceo.service';
import { CollaborationService } from './collaboration.service';
import { QaService } from './qa.service';
import { AiModule } from '../ai/ai.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [AiModule, DatabaseModule],
  controllers: [ExecutiveController, ExecutiveCmsController],
  providers: [ExecutiveRepository, CeoService, CollaborationService, QaService],
  exports: [ExecutiveRepository, CeoService, CollaborationService, QaService],
})
export class ExecutiveModule {}

