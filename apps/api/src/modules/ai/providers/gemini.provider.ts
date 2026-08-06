import { Injectable, Logger } from '@nestjs/common';
import { AIProvider, GenerateOptions, ProviderResponse } from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);

  isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY;
    return Boolean(key && key.startsWith('AIzaSy'));
  }

  async generate(options: GenerateOptions): Promise<ProviderResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing.');
    }

    const primaryModel = process.env.GEMINI_PRIMARY_MODEL || 'gemini-2.5-flash';
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-pro';

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

    // 1. Attempt Primary Gemini Model (gemini-2.5-flash)
    try {
      this.logger.log(`[GeminiProvider] Dispatching prompt to Primary Gemini Model (${primaryModel})...`);
      const primaryUrl = `https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`;
      const res = await fetch(primaryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data: any = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const totalTokens = data.usageMetadata?.totalTokenCount;
        if (text) {
          return this.formatResponse(text, `gemini (${primaryModel})`, options, totalTokens);
        }
      }
      const errText = await res.text();
      this.logger.warn(`[GeminiProvider] Primary Gemini (${primaryModel}) notice [${res.status}]: ${errText}`);
    } catch (err) {
      this.logger.warn(`[GeminiProvider] Primary Gemini (${primaryModel}) exception: ${err}`);
    }

    // 2. Fallback to Secondary Gemini Model (gemini-2.5-pro)
    this.logger.log(`[GeminiProvider] Failing over to Fallback Gemini Model (${fallbackModel})...`);
    const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${apiKey}`;
    const fallbackRes = await fetch(fallbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!fallbackRes.ok) {
      const errText = await fallbackRes.text();
      throw new Error(`Gemini API Fallback (${fallbackModel}) error status ${fallbackRes.status}: ${errText}`);
    }

    const fallbackData: any = await fallbackRes.json();
    const fallbackText = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text;
    const fallbackTokens = fallbackData.usageMetadata?.totalTokenCount;

    if (!fallbackText) {
      throw new Error('Gemini API returned empty completion contents.');
    }

    return this.formatResponse(fallbackText, `gemini (${fallbackModel})`, options, fallbackTokens);
  }

  async generateStream(options: GenerateOptions, onChunk: (chunk: string) => void): Promise<ProviderResponse> {
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
        if (options.responseSchema && typeof options.responseSchema === 'object') {
          for (const key of Object.keys(options.responseSchema)) {
            if (!(key in parsedJson)) {
              this.logger.warn(`[GeminiProvider] Response schema key '${key}' missing in parsed JSON output.`);
            }
          }
        }
      } catch (jsonErr) {
        this.logger.warn(`[GeminiProvider] JSON mode enabled but output parsing failed: ${jsonErr}`);
      }
    }

    const tokensUsed = exactTokens && typeof exactTokens === 'number'
      ? exactTokens
      : Math.round((options.prompt.length + text.length) / 4);

    return {
      text,
      providerName,
      tokensUsed,
      parsedJson,
    };
  }
}
