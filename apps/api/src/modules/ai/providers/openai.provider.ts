import { Injectable, Logger } from '@nestjs/common';
import {
  AIProvider,
  GenerateOptions,
  ProviderResponse,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenAIProvider implements AIProvider {
  public readonly name = 'openai';
  private readonly logger = new Logger(OpenAIProvider.name);

  isConfigured(): boolean {
    const key = process.env.OPENAI_API_KEY;
    return Boolean(key && key.startsWith('sk-'));
  }

  async generate(options: GenerateOptions): Promise<ProviderResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is missing.');
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o';
    this.logger.log(
      `[OpenAIProvider] Routing prompt to OpenAI API (${model})...`,
    );

    const messages: any[] = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: options.prompt });

    const payload: any = {
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 2048,
    };

    if (options.jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error status ${res.status}: ${errText}`);
    }

    const data: any = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('OpenAI API returned empty completion contents.');
    }

    let parsedJson: any = undefined;
    if (options.jsonMode) {
      try {
        parsedJson = JSON.parse(text);
        if (
          options.responseSchema &&
          typeof options.responseSchema === 'object'
        ) {
          for (const key of Object.keys(options.responseSchema)) {
            if (!(key in parsedJson)) {
              this.logger.warn(
                `[OpenAIProvider] Response schema key '${key}' missing in parsed JSON output.`,
              );
            }
          }
        }
      } catch (jsonErr) {
        this.logger.warn(
          `[OpenAIProvider] JSON mode enabled but output parsing failed: ${jsonErr}`,
        );
      }
    }

    return {
      text,
      providerName: `openai (${model})`,
      tokensUsed:
        data.usage?.total_tokens ||
        Math.round((options.prompt.length + text.length) / 4),
      parsedJson,
    };
  }

  async generateStream(
    options: GenerateOptions,
    onChunk: (chunk: string) => void,
  ): Promise<ProviderResponse> {
    const res = await this.generate(options);
    onChunk(res.text);
    return res;
  }
}
