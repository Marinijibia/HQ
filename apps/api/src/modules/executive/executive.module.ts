import { Module } from '@nestjs/common';
import { ExecutiveController } from './executive.controller';
import { ExecutiveRepository } from './executive.repository';

@Module({
  controllers: [ExecutiveController],
  providers: [ExecutiveRepository],
  exports: [ExecutiveRepository],
})
export class ExecutiveModule {}
