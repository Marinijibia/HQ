import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationRepository } from './conversation.repository';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';
import { DatabaseModule } from '../database/database.module';
import { ExecutiveModule } from '../executive/executive.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    AuthModule,
    AiModule,
    DatabaseModule,
    ExecutiveModule,
    NotificationModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationService, ConversationRepository],
  exports: [ConversationService, ConversationRepository],
})
export class ConversationModule {}
