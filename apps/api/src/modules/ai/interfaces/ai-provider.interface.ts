export interface GenerateOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  responseSchema?: Record<string, any>;
  isInternalAdminCall?: boolean;
  safetyThreshold?: 'BLOCK_NONE' | 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_ONLY_HIGH';
}

export interface ProviderResponse {
  text: string;
  providerName: string;
  tokensUsed?: number;
  parsedJson?: any;
}

export interface AIProvider {
  readonly name: string;
  isConfigured(): boolean;
  generate(options: GenerateOptions): Promise<ProviderResponse>;
  generateStream?(options: GenerateOptions, onChunk: (chunk: string) => void): Promise<ProviderResponse>;
}
