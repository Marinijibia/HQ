import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './modules/storage/storage.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { RedisModule } from './modules/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { CompanyModule } from './modules/company/company.module';
import { UserModule } from './modules/user/user.module';
import { ExecutiveModule } from './modules/executive/executive.module';
import { MissionModule } from './modules/mission/mission.module';
import { AiModule } from './modules/ai/ai.module';
import { PromptModule } from './modules/prompt/prompt.module';
import { MemoryModule } from './modules/memory/memory.module';
import { BillingModule } from './modules/billing/billing.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AssetModule } from './modules/asset/asset.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SettingsModule } from './modules/settings/settings.module';
import { IntelligenceModule } from './modules/intelligence/intelligence.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { VoiceModule } from './modules/voice/voice.module';
import { WalletModule } from './modules/wallet/wallet.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { HttpCacheInterceptor } from './common/interceptors/cache.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

import { EmailModule } from './modules/email/email.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Explicitly resolve the .env path relative to this file so it loads correctly
      // regardless of which directory Turbo/Node starts the process from
      envFilePath: [
        path.resolve(__dirname, '..', '.env'),        // dist/../.env = apps/api/.env
        path.resolve(__dirname, '..', '..', '.env'),  // fallback: monorepo root .env
      ],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    EventEmitterModule.forRoot(),
    RedisModule,
    EmailModule,
    PublicModule,
    AuthModule,
    DatabaseModule,
    HealthModule,
    CompanyModule,
    UserModule,
    ExecutiveModule,
    MissionModule,
    AiModule,
    PromptModule,
    MemoryModule,
    BillingModule,
    ConversationModule,
    NotificationModule,
    AssetModule,
    AnalyticsModule,
    SettingsModule,
    IntelligenceModule,
    MarketplaceModule,
    VoiceModule,
    WalletModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: parseInt(configService.get<string>('REDIS_PORT', '6379'), 10),
        },
      }),
    }),
    StorageModule,
    IntegrationModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 20, // 20 req/s — 3 was too tight for onboarding multi-call flows
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 120,
      },
      {
        name: 'ai',
        ttl: 60000,
        limit: 30,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 20, // raised from 5 — onboarding has legitimate auth calls per step
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
