import { Injectable, Logger } from '@nestjs/common';
import { ExecutePromptDto } from './dto/execute-prompt.dto';
import { ProviderFactory } from './factories/provider.factory';
import { ProviderResponse } from './interfaces/ai-provider.interface';

const GEMINI_EMBED_MODEL = 'text-embedding-004';


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

  /**
   * Generate a text embedding vector using Gemini text-embedding-004.
   * Returns null if embedding is unavailable (no key, quota, or network error).
   * The returned number[] is compatible with pgvector Unsupported("vector(768)") columns.
   */
  async embedText(text: string): Promise<number[] | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('[AiService.embedText] GEMINI_API_KEY not set — skipping embedding.');
      return null;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBED_MODEL}:embedContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${GEMINI_EMBED_MODEL}`,
          content: { parts: [{ text: text.substring(0, 8192) }] },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        this.logger.warn(`[AiService.embedText] Embedding API error ${res.status}: ${errText}`);
        return null;
      }

      const data: any = await res.json();
      const values: number[] | undefined = data?.embedding?.values;

      if (!Array.isArray(values) || values.length === 0) {
        this.logger.warn('[AiService.embedText] Empty embedding returned from API.');
        return null;
      }

      return values;
    } catch (err) {
      this.logger.warn(`[AiService.embedText] Embedding generation notice: ${err}`);
      return null;
    }
  }
}
