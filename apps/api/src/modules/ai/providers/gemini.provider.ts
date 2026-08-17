import { Injectable, Logger } from '@nestjs/common';
import {
  AIProvider,
  GenerateOptions,
  ProviderResponse,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);

  isConfigured(): boolean {
    const key = (process.env.GEMINI_API_KEY || '').trim();
    return Boolean(
      key &&
      key.length >= 10 &&
      !key.includes('placeholder') &&
      !key.includes('your-key'),
    );
  }

  async generate(options: GenerateOptions): Promise<ProviderResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing.');
    }

    const candidateModels = [
      process.env.GEMINI_PRIMARY_MODEL,
      'gemini-flash-latest',
      'gemini-flash-lite-latest',
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-pro-latest',
      process.env.GEMINI_FALLBACK_MODEL,
    ].filter(Boolean) as string[];

    const payload: any = {
      contents: [{ parts: [{ text: options.prompt }] }],
      generationConfig: {
        maxOutputTokens: options.maxTokens || 2048,
        temperature: options.temperature ?? 0.7,
        ...(options.jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    };

    if (options.systemPrompt) {
      payload.systemInstruction = { parts: [{ text: options.systemPrompt }] };
    }

    let lastError: string | null = null;

    for (const model of candidateModels) {
      try {
        this.logger.log(
          `[GeminiProvider] Dispatching prompt to Gemini Model (${model})...`,
        );
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15000),
        });

        if (res.ok) {
          const data: any = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          const totalTokens = data.usageMetadata?.totalTokenCount;
          if (text) {
            return this.formatResponse(
              text,
              `gemini (${model})`,
              options,
              totalTokens,
            );
          }
        }
        const errText = await res.text().catch(() => '');
        this.logger.warn(
          `[GeminiProvider] Model (${model}) notice [${res.status}]: ${errText}`,
        );
        lastError = `Model ${model} status ${res.status}: ${errText}`;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `[GeminiProvider] Model (${model}) exception: ${errMsg}`,
        );
        lastError = `Model ${model} exception: ${errMsg}`;
      }
    }

    throw new Error(
      `Gemini API execution failed across all models: ${lastError}`,
    );
  }

  async generateStream(
    options: GenerateOptions,
    onChunk: (chunk: string) => void,
  ): Promise<ProviderResponse> {
    const res = await this.generate(options);
    onChunk(res.text);
    return res;
  }

  private formatResponse(
    text: string,
    providerName: string,
    options: GenerateOptions,
    exactTokens?: number,
  ): ProviderResponse {
    let parsedJson: any = undefined;
    if (options.jsonMode) {
      try {
        parsedJson = JSON.parse(text);
      } catch {
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            parsedJson = JSON.parse(jsonMatch[1]);
          } catch {}
        }
      }
    }

    return {
      text,
      providerName,
      tokensUsed:
        exactTokens || Math.round((options.prompt.length + text.length) / 4),
      parsedJson,
    };
  }
}
