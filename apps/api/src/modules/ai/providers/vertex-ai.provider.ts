import { Injectable, Logger } from '@nestjs/common';
import {
  AIProvider,
  GenerateOptions,
  ProviderResponse,
} from '../interfaces/ai-provider.interface';

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
    const rawProject =
      process.env.VERTEX_PROJECT_ID ||
      process.env.GCP_PROJECT ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      'netify-development';

    // Strip any trailing spaces or accidentally concatenated env strings
    const projectId = rawProject.split(/\s+/)[0].trim() || 'netify-development';
    const rawLocation = process.env.VERTEX_LOCATION || 'europe-west1';
    const location = rawLocation.split(/\s+/)[0].trim() || 'europe-west1';

    try {
      // Dynamic require ensures resilience across build stages

      const { VertexAI } = require('@google-cloud/vertexai');
      this.logger.log(
        `[VertexAIProvider] Initializing Vertex AI SDK (Project: "${projectId}", Location: "${location}")...`,
      );
      this.vertexAiClient = new VertexAI({ project: projectId, location });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.initError = `Vertex AI SDK initialization failed: ${msg}`;
      this.logger.warn(`[VertexAIProvider] ${this.initError}`);
      this.vertexAiClient = null;
    }
  }

  isConfigured(): boolean {
    return Boolean(this.vertexAiClient !== null);
  }

  async generate(options: GenerateOptions): Promise<ProviderResponse> {
    if (!this.vertexAiClient) {
      this.initClient();
    }

    if (!this.vertexAiClient) {
      throw new Error(
        this.initError || 'Vertex AI SDK client is uninitialized.',
      );
    }

    const candidateModels = [
      process.env.VERTEX_MODEL || 'gemini-1.5-flash-002',
      'gemini-1.5-flash-001',
      'gemini-2.0-flash-001',
      'gemini-1.5-pro-002',
      'gemini-1.5-pro-001',
    ].filter(Boolean);

    let lastError: string | null = null;

    for (const model of candidateModels) {
      try {
        this.logger.log(
          `[VertexAIProvider] Executing prompt via Vertex AI Model (${model})...`,
        );
        const res = await this.callModel(model, options);
        if (res.text) {
          return {
            text: res.text,
            providerName: `vertex (${model})`,
            tokensUsed: res.tokensUsed,
            parsedJson: res.parsedJson,
          };
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `[VertexAIProvider] Vertex Model (${model}) notice: ${errMsg}`,
        );
        lastError = `Vertex model ${model}: ${errMsg}`;
      }
    }

    throw new Error(
      `Vertex AI execution failed across all models: ${lastError}`,
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

  private async callModel(
    modelName: string,
    options: GenerateOptions,
  ): Promise<ProviderResponse> {
    const generationConfig: any = {
      maxOutputTokens: options.maxTokens || 2048,
      temperature: options.temperature ?? 0.7,
      ...(options.jsonMode ? { responseMimeType: 'application/json' } : {}),
    };

    const modelParams: any = {
      model: modelName,
      generationConfig,
    };

    if (options.systemPrompt) {
      modelParams.systemInstruction = {
        role: 'system',
        parts: [{ text: options.systemPrompt }],
      };
    }

    const generativeModel = this.vertexAiClient.getGenerativeModel(modelParams);
    const req = {
      contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
    };

    const resp = await generativeModel.generateContent(req);
    const candidate = resp.response?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || '';
    const tokensUsed = resp.response?.usageMetadata?.totalTokenCount;

    return this.formatResponse(
      text,
      `vertex (${modelName})`,
      options,
      tokensUsed,
    );
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
