import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MissionController } from './mission.controller';
import { MissionRepository } from './mission.repository';
import { CosService } from './cos.service';
import { MoeService } from './moe.service';
import { CeoOrchestratorService } from './ceo-orchestrator.service';
import { AiModule } from '../ai/ai.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    AiModule,
    DatabaseModule,
    BullModule.registerQueue({
      name: 'mission-tasks',
    }),
  ],
  controllers: [MissionController],
  providers: [MissionRepository, CosService, MoeService, CeoOrchestratorService],
  exports: [MissionRepository, CosService, MoeService, CeoOrchestratorService, BullModule],
})
export class MissionModule {}

