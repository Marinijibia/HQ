import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MissionController } from './mission.controller';
import { MissionRepository } from './mission.repository';
import { CosService } from './cos.service';
import { MoeService } from './moe.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    AiModule,
    BullModule.registerQueue({
      name: 'mission-tasks',
    }),
  ],
  controllers: [MissionController],
  providers: [MissionRepository, CosService, MoeService],
  exports: [MissionRepository, CosService, MoeService, BullModule],
})
export class MissionModule {}
