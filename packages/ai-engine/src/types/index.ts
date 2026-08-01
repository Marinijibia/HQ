export interface AiExecutionOptions {
  provider?: 'gemini' | 'openai' | 'anthropic';
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiExecutionResult {
  text: string;
  provider: string;
  latencyMs: number;
  tokensUsed?: number;
  failoverTrace?: string[];
}
