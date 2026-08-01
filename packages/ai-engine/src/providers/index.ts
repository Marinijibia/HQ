export const SUPPORTED_PROVIDERS = ['gemini', 'openai', 'anthropic'] as const;
export type SupportedProvider = typeof SUPPORTED_PROVIDERS[number];
