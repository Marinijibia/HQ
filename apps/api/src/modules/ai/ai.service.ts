import { Injectable, Logger } from '@nestjs/common';
import { ExecutePromptDto } from './dto/execute-prompt.dto';
import { ProviderFactory } from './factories/provider.factory';
import { ProviderResponse } from './interfaces/ai-provider.interface';

export interface ExecutionResult {
  text: string;
  provider: string;
  latencyMs: number;
  tokensUsed: number;
  failoverTrace: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly providerFactory: ProviderFactory) {}

  async executePrompt(dto: ExecutePromptDto): Promise<ExecutionResult> {
    const startTime = Date.now();
    const failoverTrace: string[] = [];
    const sequence = this.providerFactory.getFailoverSequence(dto.provider, false);

    let finalResponse: ProviderResponse | null = null;

    for (const provider of sequence) {
      if (!provider.isConfigured() && provider.name !== 'hq_generative_engine') {
        failoverTrace.push(`${provider.name} (skipped: unconfigured)`);
        continue;
      }

      try {
        this.logger.log(`[AiService] Dispatching request to provider: ${provider.name}`);
        finalResponse = await provider.generate({
          prompt: dto.prompt,
          systemPrompt: dto.systemPrompt,
        });

        if (finalResponse && finalResponse.text) {
          break;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(`[AiService] Provider '${provider.name}' execution notice: ${errorMessage}`);
        failoverTrace.push(`${provider.name} (failed: ${errorMessage})`);
      }
    }

    // Ultimate fallback if no provider returned text
    if (!finalResponse || !finalResponse.text) {
      this.logger.log(`[AiService] Executing local HQ dynamic engine fallback...`);
      const hqEngine = this.providerFactory.getPrimaryProvider('hq_engine', true);
      finalResponse = await hqEngine.generate({
        prompt: dto.prompt,
        systemPrompt: dto.systemPrompt,
      });
    }

    const latencyMs = Date.now() - startTime;
    const tokensUsed = finalResponse.tokensUsed || Math.round((dto.prompt.length + finalResponse.text.length) / 4);

    this.logger.log(`[AiService] Execution completed | Provider: ${finalResponse.providerName} | Latency: ${latencyMs}ms | Tokens: ${tokensUsed}`);

    return {
      text: finalResponse.text,
      provider: finalResponse.providerName,
      latencyMs,
      tokensUsed,
      failoverTrace,
    };
  }
}
