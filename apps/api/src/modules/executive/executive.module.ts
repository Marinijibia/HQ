import { Module } from '@nestjs/common';
import { ExecutiveController } from './executive.controller';
import { ExecutiveRepository } from './executive.repository';
import { CeoService } from './ceo.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [ExecutiveController],
  providers: [ExecutiveRepository, CeoService],
  exports: [ExecutiveRepository, CeoService],
})
export class ExecutiveModule {}
