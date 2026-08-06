import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { CopywriterService } from './copywriter.service';
import { DesignerService } from './designer.service';
import { AiController } from './ai.controller';
import { ProviderFactory } from './factories/provider.factory';
import { VertexAIProvider } from './providers/vertex-ai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { HqEngineProvider } from './providers/hq-engine.provider';

@Module({
  controllers: [AiController],
  providers: [
    VertexAIProvider,
    GeminiProvider,
    OpenAIProvider,
    AnthropicProvider,
    HqEngineProvider,
    ProviderFactory,
    AiService,
    CopywriterService,
    DesignerService,
  ],
  exports: [AiService, CopywriterService, DesignerService, ProviderFactory],
})
export class AiModule implements OnModuleInit {
  private readonly logger = new Logger(AiModule.name);

  onModuleInit() {
    const rawProvider = process.env.AI_PROVIDER;
    const provider = (rawProvider || '').toLowerCase().trim();
    const displayProvider = rawProvider ? `'${rawProvider}'` : 'unconfigured (defaulting to active provider resolution)';
    this.logger.log(`[AiModule] Initializing AI Operating System Module (Configured System Provider: ${displayProvider})...`);

    if (provider === 'vertex') {
      const projectId = process.env.VERTEX_PROJECT_ID || process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
      const location = process.env.VERTEX_LOCATION || 'europe-west1';
      const model = process.env.VERTEX_MODEL || 'gemini-2.5-flash';

      if (!projectId) {
        const errorMsg = `[AiModule Startup Validation Error] AI_PROVIDER is set to 'vertex', but VERTEX_PROJECT_ID (or GCP_PROJECT/GOOGLE_CLOUD_PROJECT) is missing. Please set VERTEX_PROJECT_ID in environment variables.`;
        this.logger.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
      } else {
        this.logger.log(`✅ [AiModule Startup Validation] Vertex AI active (Project: ${projectId}, Location: ${location}, Model: ${model}).`);
      }
    }
  }
}
