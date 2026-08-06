import { Injectable, Logger } from '@nestjs/common';
import { AIProvider } from '../interfaces/ai-provider.interface';
import { VertexAIProvider } from '../providers/vertex-ai.provider';
import { GeminiProvider } from '../providers/gemini.provider';
import { OpenAIProvider } from '../providers/openai.provider';
import { AnthropicProvider } from '../providers/anthropic.provider';
import { HqEngineProvider } from '../providers/hq-engine.provider';

@Injectable()
export class ProviderFactory {
  private readonly logger = new Logger(ProviderFactory.name);
  private readonly providersMap = new Map<string, AIProvider>();

  constructor(
    private readonly vertexProvider: VertexAIProvider,
    private readonly geminiProvider: GeminiProvider,
    private readonly openAiProvider: OpenAIProvider,
    private readonly anthropicProvider: AnthropicProvider,
    private readonly hqEngineProvider: HqEngineProvider,
  ) {
    this.providersMap.set('vertex', this.vertexProvider);
    this.providersMap.set('gemini', this.geminiProvider);
    this.providersMap.set('openai', this.openAiProvider);
    this.providersMap.set('anthropic', this.anthropicProvider);
    this.providersMap.set('hq_engine', this.hqEngineProvider);
  }

  /**
   * Resolves the authoritative system provider.
   * Restricts requested DTO overrides to internal/admin calls only.
   */
  getPrimaryProvider(requestedProviderName?: string, isInternalAdminCall: boolean = false): AIProvider {
    const configProvider = (process.env.AI_PROVIDER || '').toLowerCase().trim();

    // DTO override is ONLY allowed if explicitly marked as an internal/admin request
    let targetName = configProvider || 'vertex';
    if (requestedProviderName && isInternalAdminCall) {
      targetName = requestedProviderName.toLowerCase().trim();
      this.logger.log(`[ProviderFactory] Authorized internal admin override to provider: ${targetName}`);
    } else if (requestedProviderName && requestedProviderName.toLowerCase() !== targetName) {
      this.logger.warn(`[ProviderFactory] Ignored unprivileged request override attempt '${requestedProviderName}'. Authoritative system provider '${targetName}' enforced.`);
    }

    const provider = this.providersMap.get(targetName);
    if (provider && provider.isConfigured()) {
      return provider;
    }

    // If configured provider is not ready, check if vertex is available or fallback
    if (targetName !== 'vertex' && this.vertexProvider.isConfigured()) {
      return this.vertexProvider;
    }
    if (targetName !== 'gemini' && this.geminiProvider.isConfigured()) {
      return this.geminiProvider;
    }

    this.logger.warn(`[ProviderFactory] Configured provider '${targetName}' is unconfigured. Utilizing HQ dynamic engine fallback.`);
    return this.hqEngineProvider;
  }

  /**
   * Generates a controlled failover sequence governed strictly by AI_FAILOVER_ENABLED and AI_FAILOVER_PROVIDERS
   */
  getFailoverSequence(requestedProviderName?: string, isInternalAdminCall: boolean = false): AIProvider[] {
    const primary = this.getPrimaryProvider(requestedProviderName, isInternalAdminCall);
    const failoverEnabled = (process.env.AI_FAILOVER_ENABLED || 'false').toLowerCase().trim() === 'true';

    // If failover is disabled (default), return only the primary provider
    if (!failoverEnabled) {
      return [primary];
    }

    // Failover enabled: Parse explicit whitelist from AI_FAILOVER_PROVIDERS (e.g. "gemini" or "gemini,openai")
    const sequence: AIProvider[] = [primary];
    const allowedProvidersRaw = process.env.AI_FAILOVER_PROVIDERS || '';
    const allowedKeys = allowedProvidersRaw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    for (const key of allowedKeys) {
      const p = this.providersMap.get(key);
      if (p && p.name !== primary.name && p.isConfigured()) {
        sequence.push(p);
      }
    }

    // Append local HQ fallback engine at the end of failover sequence
    sequence.push(this.hqEngineProvider);

    return sequence;
  }
}
