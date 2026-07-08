import { Module } from '@nestjs/common';
import { MissionController } from './mission.controller';
import { MissionRepository } from './mission.repository';
import { CosService } from './cos.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [MissionController],
  providers: [MissionRepository, CosService],
  exports: [MissionRepository, CosService],
})
export class MissionModule {}
