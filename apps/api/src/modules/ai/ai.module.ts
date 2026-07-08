import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { CopywriterService } from './copywriter.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [AiService, CopywriterService],
  exports: [AiService, CopywriterService],
})
export class AiModule {}
