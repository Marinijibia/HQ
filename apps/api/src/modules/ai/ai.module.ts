import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { CopywriterService } from './copywriter.service';
import { DesignerService } from './designer.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [AiService, CopywriterService, DesignerService],
  exports: [AiService, CopywriterService, DesignerService],
})
export class AiModule {}
