import { Injectable, Logger } from '@nestjs/common';
import { AIProvider, GenerateOptions, ProviderResponse } from '../interfaces/ai-provider.interface';

@Injectable()
export class AnthropicProvider implements AIProvider {
  public readonly name = 'anthropic';
  private readonly logger = new Logger(AnthropicProvider.name);

  isConfigured(): boolean {
    const key = process.env.ANTHROPIC_API_KEY;
    return Boolean(key && key.startsWith('sk-ant-'));
  }

  async generate(options: GenerateOptions): Promise<ProviderResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is missing.');
    }

    const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022';
    this.logger.log(`[AnthropicProvider] Routing prompt to Anthropic API (${model})...`);

    const payload: any = {
      model,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature ?? 0.7,
      messages: [{ role: 'user', content: options.prompt }],
    };

    if (options.systemPrompt) {
      payload.system = options.systemPrompt;
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API error status ${res.status}: ${errText}`);
    }

    const data: any = await res.json();
    const text = data.content?.[0]?.text;
    if (!text) {
      throw new Error('Anthropic API returned empty completion contents.');
    }

    let parsedJson: any = undefined;
    if (options.jsonMode) {
      try {
        parsedJson = JSON.parse(text);
        if (options.responseSchema && typeof options.responseSchema === 'object') {
          for (const key of Object.keys(options.responseSchema)) {
            if (!(key in parsedJson)) {
              this.logger.warn(`[AnthropicProvider] Response schema key '${key}' missing in parsed JSON output.`);
            }
          }
        }
      } catch (jsonErr) {
        this.logger.warn(`[AnthropicProvider] JSON mode enabled but output parsing failed: ${jsonErr}`);
      }
    }

    const exactTokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
    const tokensUsed = exactTokens > 0 ? exactTokens : Math.round((options.prompt.length + text.length) / 4);

    return {
      text,
      providerName: `anthropic (${model})`,
      tokensUsed,
      parsedJson,
    };
  }

  async generateStream(options: GenerateOptions, onChunk: (chunk: string) => void): Promise<ProviderResponse> {
    const res = await this.generate(options);
    onChunk(res.text);
    return res;
  }
}
