import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { ExecutePromptDto } from './dto/execute-prompt.dto';

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

  async executePrompt(dto: ExecutePromptDto): Promise<ExecutionResult> {
    const startTime = Date.now();
    const startProvider = dto.provider || 'gemini';
    const maxRetries = 3;
    const failoverTrace: string[] = [];

    const providersSequence = ['gemini', 'openai', 'anthropic'];
    let currentProviderIndex = providersSequence.indexOf(startProvider);
    if (currentProviderIndex === -1) {
      currentProviderIndex = 0;
    }

    while (currentProviderIndex < providersSequence.length) {
      const activeProvider = providersSequence[currentProviderIndex];
      let attempt = 1;
      let success = false;
      let responseText = '';

      while (attempt <= maxRetries && !success) {
        try {
          this.logger.log(
            `[AI Gateway] Routing to ${activeProvider} (Attempt ${attempt}/${maxRetries})`,
          );

          // Simulate failures for test runs
          if (dto.simulateFailure && activeProvider === 'gemini') {
            throw new Error(
              'Gemini API quota exceeded or connection timed out.',
            );
          }

          // Mock responses for standard sandbox environments
          responseText = this.mockCompletion(
            activeProvider,
            dto.prompt,
            dto.systemPrompt,
          );
          success = true;
          failoverTrace.push(
            `${activeProvider} (succeeded on attempt ${attempt})`,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.warn(
            `[AI Gateway] ${activeProvider} attempt ${attempt} failed: ${errorMessage}`,
          );
          failoverTrace.push(
            `${activeProvider} (failed: attempt ${attempt} - ${errorMessage})`,
          );
          attempt++;
          // Add small backoff delay between retries
          await new Promise((r) => setTimeout(r, 100));
        }
      }

      if (success) {
        const latencyMs = Date.now() - startTime;
        const tokensUsed = Math.round(
          (dto.prompt.length + responseText.length) / 4,
        );

        this.logger.log(
          `[AI Gateway] Successfully resolved prompt using ${activeProvider} in ${latencyMs}ms. Tokens: ${tokensUsed}`,
        );

        return {
          text: responseText,
          provider: activeProvider,
          latencyMs,
          tokensUsed,
          failoverTrace,
        };
      }

      // If we are here, activeProvider failed all retries. Failover to next provider.
      this.logger.error(
        `[AI Gateway] ${activeProvider} exhausted all retries. Activating failover strategy to next target...`,
      );
      currentProviderIndex++;
    }

    // Exhausted all providers in sequence
    throw new BadGatewayException({
      message:
        'AI Gateway exhausted all dynamic providers and failed to resolve prompt completion.',
      failoverTrace,
    });
  }

  private mockCompletion(
    provider: string,
    prompt: string,
    systemPrompt?: string,
  ): string {
    const p = prompt.toLowerCase();

    // CEO strategic plan mocks
    if (
      p.includes('petroleum') ||
      p.includes('oil') ||
      p.includes('logistics')
    ) {
      return JSON.stringify({
        status: 'Approved',
        summary: 'Q3 Petroleum Outreach Proposal aligned with corporate goals.',
        decisions: [
          'Assign Alistair for competitor benchmarking',
          'Assign Linus to build custom templates',
        ],
        recommendations: [
          {
            title: 'West African Corridors Scaling',
            recommendedDirectors: ['Alistair Thorne', 'Rashid Al-Mansoori'],
            confidenceScore: 92,
          },
        ],
      });
    }

    // Default template responses
    return `[Completion generated via ${provider.toUpperCase()}]
System Instructions: ${systemPrompt || 'None'}
Objective Resolved: "${prompt.substring(0, 100)}..."
All compliance standards and zero-trust guidelines verified.`;
  }
}
