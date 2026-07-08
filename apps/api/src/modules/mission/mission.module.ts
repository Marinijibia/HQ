import { Module } from '@nestjs/common';
import { MissionController } from './mission.controller';
import { MissionRepository } from './mission.repository';

@Module({
  controllers: [MissionController],
  providers: [MissionRepository],
  exports: [MissionRepository],
})
export class MissionModule {}
