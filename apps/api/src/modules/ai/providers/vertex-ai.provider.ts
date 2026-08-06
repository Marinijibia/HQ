import { Injectable, Logger } from '@nestjs/common';
import { AIProvider, GenerateOptions, ProviderResponse } from '../interfaces/ai-provider.interface';

@Injectable()
export class VertexAIProvider implements AIProvider {
  public readonly name = 'vertex';
  private readonly logger = new Logger(VertexAIProvider.name);
  private vertexAiClient: any = null;
  private initError: string | null = null;

  constructor() {
    this.initClient();
  }

  private initClient() {
    this.initError = null;
    const providerConfig = (process.env.AI_PROVIDER || '').toLowerCase().trim();
    const projectId = process.env.VERTEX_PROJECT_ID || process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.VERTEX_LOCATION || 'europe-west1';

    if (!projectId) {
      if (providerConfig === 'vertex') {
        this.initError = 'Vertex AI is enabled (AI_PROVIDER=vertex) but VERTEX_PROJECT_ID is missing. Please set VERTEX_PROJECT_ID in environment variables.';
        this.logger.error(`[VertexAIProvider] Initialization error: ${this.initError}`);
      } else {
        this.initError = 'VERTEX_PROJECT_ID is not configured.';
      }
      this.vertexAiClient = null;
      return;
    }

    try {
      // Dynamic require ensures local compilation resilience before yarn install linking
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { VertexAI } = require('@google-cloud/vertexai');
      this.logger.log(`[VertexAIProvider] Initializing Vertex AI SDK (Project: ${projectId}, Location: ${location}) via Cloud Run IAM ADC...`);
      this.vertexAiClient = new VertexAI({ project: projectId, location });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.initError = `Vertex AI SDK initialization failed: ${msg}`;
      this.logger.warn(`[VertexAIProvider] ${this.initError}`);
      this.vertexAiClient = null;
    }
  }

  isConfigured(): boolean {
    const projectId = process.env.VERTEX_PROJECT_ID || process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
    return Boolean(projectId && this.vertexAiClient !== null);
  }

  async generate(options: GenerateOptions): Promise<ProviderResponse> {
    if (!this.vertexAiClient) {
      this.initClient();
    }

    if (!this.vertexAiClient) {
      throw new Error(this.initError || 'Vertex AI SDK client is uninitialized or VERTEX_PROJECT_ID is missing.');
    }

    const primaryModel = process.env.VERTEX_MODEL || 'gemini-2.5-flash';
    const fallbackModel = process.env.VERTEX_FALLBACK_MODEL || 'gemini-2.5-pro';

    // 1. Primary Model Execution (gemini-2.5-flash)
    try {
      this.logger.log(`[VertexAIProvider] Executing prompt via Primary Model (${primaryModel})...`);
      const res = await this.callModel(primaryModel, options);
      if (res.text) {
        return {
          text: res.text,
          providerName: `vertex (${primaryModel})`,
          tokensUsed: res.tokensUsed,
          parsedJson: res.parsedJson,
        };
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`[VertexAIProvider] Primary Model (${primaryModel}) transient failure: ${errMsg}`);
    }

    // 2. Secondary Model Fallback (gemini-2.5-pro)
    this.logger.log(`[VertexAIProvider] Failing over to Secondary Model (${fallbackModel})...`);
    const fallbackRes = await this.callModel(fallbackModel, options);
    if (!fallbackRes.text) {
      throw new Error(`Vertex AI returned empty completion content for ${fallbackModel}.`);
    }

    return {
      text: fallbackRes.text,
      providerName: `vertex (${fallbackModel})`,
      tokensUsed: fallbackRes.tokensUsed,
      parsedJson: fallbackRes.parsedJson,
    };
  }

  async generateStream(options: GenerateOptions, onChunk: (chunk: string) => void): Promise<ProviderResponse> {
    if (!this.vertexAiClient) {
      this.initClient();
    }

    if (!this.vertexAiClient) {
      throw new Error(this.initError || 'Vertex AI SDK client is uninitialized.');
    }

    const modelName = process.env.VERTEX_MODEL || 'gemini-2.5-flash';
    const generativeModel = this.vertexAiClient.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: options.maxTokens || 2048,
        temperature: options.temperature ?? 0.7,
      },
    });

    const req = { contents: [{ role: 'user', parts: [{ text: options.prompt }] }] };
    const streamingResp = await generativeModel.generateContentStream(req);

    let fullText = '';
    for await (const item of streamingResp.stream) {
      const chunkText = item.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (chunkText) {
        fullText += chunkText;
        onChunk(chunkText);
      }
    }

    const aggregatedResp = await streamingResp.response;
    const tokensUsed = aggregatedResp?.usageMetadata?.totalTokenCount || Math.round((options.prompt.length + fullText.length) / 4);

    return {
      text: fullText,
      providerName: `vertex-stream (${modelName})`,
      tokensUsed,
    };
  }

  private async callModel(
    modelName: string,
    options: GenerateOptions,
  ): Promise<{ text: string; tokensUsed: number; parsedJson?: any }> {
    let safetySettings: any[] = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { HarmCategory, HarmBlockThreshold } = require('@google-cloud/vertexai');
      if (HarmCategory && HarmBlockThreshold) {
        safetySettings = [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ];
      }
    } catch {
      // Fallback empty safety settings if SDK constants unresolvable
    }

    const generativeModelOptions: any = {
      model: modelName,
      generationConfig: {
        maxOutputTokens: options.maxTokens || 2048,
        temperature: options.temperature ?? 0.7,
        ...(options.jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
      ...(safetySettings.length > 0 ? { safetySettings } : {}),
    };

    if (options.systemPrompt) {
      generativeModelOptions.systemInstruction = {
        role: 'system',
        parts: [{ text: options.systemPrompt }],
      };
    }

    const generativeModel = this.vertexAiClient.getGenerativeModel(generativeModelOptions);
    const req = {
      contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
    };

    const resp = await generativeModel.generateContent(req);
    const candidate = resp.response?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || '';

    if (!text) {
      throw new Error(`Vertex AI model ${modelName} returned empty text.`);
    }

    // Extract exact usage metadata from Vertex AI response
    const totalTokens = resp.response?.usageMetadata?.totalTokenCount;
    const tokensUsed = totalTokens && typeof totalTokens === 'number'
      ? totalTokens
      : Math.round((options.prompt.length + text.length) / 4);

    let parsedJson: any = undefined;

    if (options.jsonMode) {
      try {
        parsedJson = JSON.parse(text);
        if (options.responseSchema && typeof options.responseSchema === 'object') {
          for (const key of Object.keys(options.responseSchema)) {
            if (!(key in parsedJson)) {
              this.logger.warn(`[VertexAIProvider] Response schema key '${key}' missing in parsed JSON output.`);
            }
          }
        }
      } catch (jsonErr) {
        this.logger.warn(`[VertexAIProvider] JSON mode enabled but output parsing failed: ${jsonErr}`);
      }
    }

    return { text, tokensUsed, parsedJson };
  }
}
