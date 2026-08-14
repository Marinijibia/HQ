import { Injectable, Logger } from '@nestjs/common';
import { AIProvider, GenerateOptions, ProviderResponse } from '../interfaces/ai-provider.interface';

/**
 * HQ Graceful Degradation Engine
 *
 * This provider is the absolute last resort — it fires ONLY when every real
 * AI provider (Vertex, Gemini, OpenAI, Anthropic) has failed or is unconfigured.
 *
 * It returns a structured, professional "temporarily unavailable" response that:
 * - Never contains hardcoded company names, executive names, or industry content
 * - Never fabricates business intelligence or fake strategic output
 * - Gives the owner/user a clear signal that the AI service is degraded
 * - Logs the failure prominently so it is caught in monitoring
 */
@Injectable()
export class HqEngineProvider implements AIProvider {
  public readonly name = 'hq_generative_engine';
  private readonly logger = new Logger(HqEngineProvider.name);

  isConfigured(): boolean {
    return true; // Always available as last-resort graceful degradation
  }

  async generate(options: GenerateOptions): Promise<ProviderResponse> {
    this.logger.error(
      '[HqEngineProvider] ⚠️ All real AI providers have failed or are unconfigured. ' +
      'Returning graceful degradation response. Check VERTEX_PROJECT_ID, GEMINI_API_KEY, ' +
      'OPENAI_API_KEY, and ANTHROPIC_API_KEY environment variables.',
    );

    const text = this.buildDegradationResponse(options);

    let parsedJson: any = undefined;
    if (options.jsonMode) {
      parsedJson = {
        error: 'AI_SERVICE_DEGRADED',
        message: 'AI providers are temporarily unavailable. Please try again shortly.',
        available: false,
      };
      return {
        text: JSON.stringify(parsedJson),
        providerName: 'hq_generative_engine (degraded)',
        tokensUsed: 0,
        parsedJson,
      };
    }

    return {
      text,
      providerName: 'hq_generative_engine (degraded)',
      tokensUsed: 0,
    };
  }

  async generateStream(options: GenerateOptions, onChunk: (chunk: string) => void): Promise<ProviderResponse> {
    const res = await this.generate(options);
    onChunk(res.text);
    return res;
  }

  /**
   * Builds a graceful, org-agnostic degradation message.
   * The message is professional and does NOT contain any company-specific content.
   */
  private buildDegradationResponse(options: GenerateOptions): string {
    // Detect if this is a greeting/conversational prompt vs an execution prompt
    const promptLower = (options.prompt || '').toLowerCase();
    const isGreeting =
      promptLower.includes('hello') ||
      promptLower.includes('hi ') ||
      promptLower === 'hi' ||
      promptLower.includes('who are you');

    if (isGreeting) {
      return [
        'Greetings! Your AI Executive Board is currently initializing.',
        '',
        'Our AI services are experiencing a brief interruption. The executive team will be fully operational shortly.',
        '',
        'Please try again in a moment or contact support if this persists.',
      ].join('\n');
    }

    return [
      '**AI Executive Board — Service Notice**',
      '',
      'Our AI analysis services are temporarily unavailable. All real AI providers are currently unreachable.',
      '',
      'Your request has been logged and will be processed as soon as services are restored.',
      '',
      '**What to check:**',
      '- Verify your AI provider credentials in the environment configuration',
      '- Ensure `VERTEX_PROJECT_ID` is set for production (primary provider)',
      '- Ensure `GEMINI_API_KEY` is set for development fallback',
      '',
      'Please try again shortly.',
    ].join('\n');
  }
}
