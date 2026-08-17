import { Injectable, Logger } from '@nestjs/common';
import { AIProvider } from '../interfaces/ai-provider.interface';
import { VertexAIProvider } from '../providers/vertex-ai.provider';
import { GeminiProvider } from '../providers/gemini.provider';
import { OpenAIProvider } from '../providers/openai.provider';
import { AnthropicProvider } from '../providers/anthropic.provider';
import { HqEngineProvider } from '../providers/hq-engine.provider';

/**
 * Production Provider Priority Chain:
 *
 * 1. Vertex AI      (gemini-2.5-flash → 2.5-pro) — PRIMARY  [Cloud Run IAM ADC, no API key]
 * 2. Gemini Direct  (gemini-2.5-flash)             — FAILOVER 1 [GEMINI_API_KEY]
 * 3. OpenAI         (gpt-4o)                        — FAILOVER 2 [OPENAI_API_KEY]
 * 4. Anthropic      (claude-3-5-sonnet)             — FAILOVER 3 [ANTHROPIC_API_KEY]
 * 5. HQ Graceful    (degradation notice)            — LAST RESORT [no fake content]
 *
 * Controlled by env vars:
 *   AI_PROVIDER=vertex               # Primary (default)
 *   AI_FAILOVER_ENABLED=true         # Enable automatic failover
 *   AI_FAILOVER_PROVIDERS=gemini,openai,anthropic  # Ordered failover list
 */
@Injectable()
export class ProviderFactory {
  private readonly logger = new Logger(ProviderFactory.name);
  private readonly providersMap = new Map<string, AIProvider>();

  /**
   * Ordered production failover sequence.
   * Used when AI_FAILOVER_PROVIDERS env var is not set.
   */
  private readonly PRODUCTION_FAILOVER_ORDER = [
    'vertex',
    'gemini',
    'openai',
    'anthropic',
  ] as const;

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

    this.logProviderStatus();
  }

  /**
   * Log which providers are configured at startup — surfaces misconfiguration early.
   */
  private logProviderStatus(): void {
    const configured: string[] = [];
    const unconfigured: string[] = [];

    for (const [name, provider] of this.providersMap.entries()) {
      if (name === 'hq_engine') continue; // Always available, don't count it
      if (provider.isConfigured()) {
        configured.push(name);
      } else {
        unconfigured.push(name);
      }
    }

    this.logger.log(
      `[ProviderFactory] Configured providers: [${configured.join(', ') || 'NONE'}] | ` +
        `Unconfigured: [${unconfigured.join(', ') || 'none'}]`,
    );

    if (configured.length === 0) {
      this.logger.error(
        '[ProviderFactory] ⚠️ NO real AI providers are configured! All requests will fall back to the graceful degradation engine. ' +
          'Set VERTEX_PROJECT_ID (production) or GEMINI_API_KEY (development).',
      );
    }
  }

  /**
   * Resolves the authoritative primary provider.
   * - Production: AI_PROVIDER=vertex (uses Cloud Run IAM ADC — no API key needed)
   * - Development: Vertex unconfigured → auto-falls to Gemini if GEMINI_API_KEY is set
   * - DTO override is ONLY allowed for internal/admin calls
   */
  getPrimaryProvider(
    requestedProviderName?: string,
    isInternalAdminCall: boolean = false,
  ): AIProvider {
    const configProvider = (process.env.AI_PROVIDER || '').toLowerCase().trim();

    // Default to vertex in production, auto-detect in dev
    let targetName = configProvider || 'vertex';

    // DTO override: ONLY allowed for explicitly flagged internal/admin requests
    if (requestedProviderName && isInternalAdminCall) {
      targetName = requestedProviderName.toLowerCase().trim();
      this.logger.log(
        `[ProviderFactory] Authorized internal admin override → provider: ${targetName}`,
      );
    } else if (
      requestedProviderName &&
      requestedProviderName.toLowerCase() !== targetName
    ) {
      this.logger.warn(
        `[ProviderFactory] Unprivileged provider override '${requestedProviderName}' rejected. ` +
          `Enforcing authoritative provider: '${targetName}'.`,
      );
    }

    const provider = this.providersMap.get(targetName);
    if (provider && provider.isConfigured()) {
      return provider;
    }

    // Configured provider is not ready — walk the production failover order
    this.logger.warn(
      `[ProviderFactory] Primary provider '${targetName}' is not configured. ` +
        `Walking production failover chain: ${this.PRODUCTION_FAILOVER_ORDER.join(' → ')}`,
    );

    for (const name of this.PRODUCTION_FAILOVER_ORDER) {
      if (name === targetName) continue; // Already tried
      const fallback = this.providersMap.get(name);
      if (fallback && fallback.isConfigured()) {
        this.logger.log(
          `[ProviderFactory] Auto-selected configured provider: ${name}`,
        );
        return fallback;
      }
    }

    this.logger.error(
      '[ProviderFactory] No real AI providers are configured. Using graceful degradation engine.',
    );
    return this.hqEngineProvider;
  }

  /**
   * Generates a controlled failover sequence.
   *
   * Failover order (when AI_FAILOVER_ENABLED=true):
   *   1. Primary provider (vertex by default)
   *   2. AI_FAILOVER_PROVIDERS list (e.g. "gemini,openai,anthropic") — in order
   *   3. HQ graceful degradation engine (always last)
   *
   * When AI_FAILOVER_ENABLED=false (not recommended for production):
   *   Only the primary provider is returned. If it fails, the request errors.
   */
  getFailoverSequence(
    requestedProviderName?: string,
    isInternalAdminCall: boolean = false,
  ): AIProvider[] {
    const primary = this.getPrimaryProvider(
      requestedProviderName,
      isInternalAdminCall,
    );
    const failoverEnabled =
      (process.env.AI_FAILOVER_ENABLED || 'true').toLowerCase().trim() ===
      'true';

    if (!failoverEnabled) {
      this.logger.warn(
        '[ProviderFactory] AI_FAILOVER_ENABLED=false — single provider mode active.',
      );
      return [primary];
    }

    const sequence: AIProvider[] = [primary];

    // Parse explicit failover list from env var, or use the production default order
    const allowedProvidersRaw =
      process.env.AI_FAILOVER_PROVIDERS ||
      this.PRODUCTION_FAILOVER_ORDER.join(',');
    const allowedKeys = allowedProvidersRaw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    for (const key of allowedKeys) {
      if (key === primary.name) continue; // Skip if already primary
      const p = this.providersMap.get(key);
      if (p && p.isConfigured() && !sequence.find((s) => s.name === p.name)) {
        sequence.push(p);
        this.logger.log(`[ProviderFactory] Added failover provider: ${key}`);
      }
    }

    // Always append the graceful degradation engine as the absolute last resort
    sequence.push(this.hqEngineProvider);

    this.logger.log(
      `[ProviderFactory] Failover sequence: ${sequence.map((p) => p.name).join(' → ')}`,
    );

    return sequence;
  }
}
