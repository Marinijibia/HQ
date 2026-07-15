import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { ExecutePromptDto } from './dto/execute-prompt.dto';

export interface ExecutionResult {
  text: string;
  provider: string;
  latencyMs: number;
  tokensUsed: number;
  failoverTrace: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async executePrompt(dto: ExecutePromptDto): Promise<ExecutionResult> {
    const startTime = Date.now();
    const startProvider = dto.provider || 'gemini';
    const maxRetries = 3;
    const failoverTrace: string[] = [];

    const providersSequence = ['gemini', 'openai', 'anthropic'];
    let currentProviderIndex = providersSequence.indexOf(startProvider);
    if (currentProviderIndex === -1) {
      currentProviderIndex = 0;
    }

    while (currentProviderIndex < providersSequence.length) {
      const activeProvider = providersSequence[currentProviderIndex];
      let attempt = 1;
      let success = false;
      let responseText = '';

      while (attempt <= maxRetries && !success) {
        try {
          this.logger.log(
            `[AI Gateway] Routing to ${activeProvider} (Attempt ${attempt}/${maxRetries})`,
          );

          // Simulate failures for test runs
          if (dto.simulateFailure && activeProvider === 'gemini') {
            throw new Error(
              'Gemini API quota exceeded or connection timed out.',
            );
          }

          // If real key exists, call real LLM API; otherwise call mock
          if (activeProvider === 'gemini' && process.env.GEMINI_API_KEY && !dto.simulateFailure) {
            responseText = await this.callGemini(dto.prompt, dto.systemPrompt);
          } else if (activeProvider === 'openai' && process.env.OPENAI_API_KEY) {
            responseText = await this.callOpenAI(dto.prompt, dto.systemPrompt);
          } else if (activeProvider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
            responseText = await this.callAnthropic(dto.prompt, dto.systemPrompt);
          } else {
            // Mock responses for standard sandbox environments
            responseText = this.mockCompletion(
              activeProvider,
              dto.prompt,
              dto.systemPrompt,
            );
          }

          success = true;
          failoverTrace.push(
            `${activeProvider} (succeeded on attempt ${attempt})`,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.warn(
            `[AI Gateway] ${activeProvider} attempt ${attempt} failed: ${errorMessage}`,
          );
          failoverTrace.push(
            `${activeProvider} (failed: attempt ${attempt} - ${errorMessage})`,
          );
          attempt++;
          // Add small backoff delay between retries
          await new Promise((r) => setTimeout(r, 100));
        }
      }

      if (success) {
        const latencyMs = Date.now() - startTime;
        const tokensUsed = Math.round(
          (dto.prompt.length + responseText.length) / 4,
        );

        this.logger.log(
          `[AI Gateway] Successfully resolved prompt using ${activeProvider} in ${latencyMs}ms. Tokens: ${tokensUsed}`,
        );

        return {
          text: responseText,
          provider: activeProvider,
          latencyMs,
          tokensUsed,
          failoverTrace,
        };
      }

      // If we are here, activeProvider failed all retries. Failover to next provider.
      this.logger.error(
        `[AI Gateway] ${activeProvider} exhausted all retries. Activating failover strategy to next target...`,
      );
      currentProviderIndex++;
    }

    // Exhausted all providers in sequence
    throw new BadGatewayException({
      message:
        'AI Gateway exhausted all dynamic providers and failed to resolve prompt completion.',
      failoverTrace,
    });
  }

  private async callGemini(prompt: string, systemPrompt?: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
    const payload: any = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };
    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error status ${res.status}: ${errText}`);
    }

    const data: any = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini API returned empty completion contents');
    }
    return text;
  }

  private async callOpenAI(prompt: string, systemPrompt?: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';
    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error status ${res.status}: ${errText}`);
    }

    const data: any = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('OpenAI API returned empty completion contents');
    }
    return text;
  }

  private async callAnthropic(prompt: string, systemPrompt?: string): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const url = 'https://api.anthropic.com/v1/messages';
    const payload: any = {
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    };
    if (systemPrompt) {
      payload.system = systemPrompt;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey!,
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
      throw new Error('Anthropic API returned empty completion contents');
    }
    return text;
  }

  private mockCompletion(
    provider: string,
    prompt: string,
    systemPrompt?: string,
  ): string {
    const p = prompt.toLowerCase();

    // Domain Draft completions
    if (p.includes('domain: "identity"') || p.includes('domain: identity')) {
      return JSON.stringify({
        orgName: 'HQ Corporation',
        hqName: 'HQ Strategic Base',
        legalEntity: 'HQ Software Systems Ltd.',
        country: 'United Kingdom',
        industry: 'Artificial Intelligence / B2B SaaS',
        size: '50-200 employees',
        stage: 'Series A Growth',
        yearFounded: '2024',
        website: 'https://hq-platform.ai'
      });
    }
    if (p.includes('domain: "businessmodel"') || p.includes('domain: businessmodel')) {
      return JSON.stringify({
        products: 'AI C-Suite Boardroom, Autopilot Agentic Workflows',
        revenueStreams: 'B2B SaaS monthly subscriptions, Enterprise credit ledgers',
        targetCustomers: 'Mid-market corporations, strategic operations team leads',
        pricingStrategy: 'Tiered seats pricing + pay-as-you-use token billing',
        salesModel: 'Product-led growth with enterprise sales assistance',
        geographies: 'North America, Europe, United Kingdom',
        positioning: 'First fully autonomous AI Executive OS for corporate alignment'
      });
    }
    if (p.includes('domain: "structure"') || p.includes('domain: structure')) {
      return JSON.stringify({
        departments: 'Executive Office, Engineering, Product & Design, Operations, Finance, Sales & Marketing, Legal',
        decisionMakers: 'CEO (Elena Rostova), CTO (Dr. Hiroshi Tanaka), CFO (Sophia Sterling)',
        reportingStructure: 'Flat team structure, task queues parallelized by Arthur (Chief of Staff)'
      });
    }
    if (p.includes('domain: "strategy"') || p.includes('domain: strategy')) {
      return JSON.stringify({
        vision: 'Provide an autonomous AI executive workforce to every enterprise globally.',
        mission: 'Empower corporate strategic teams by delegating operations to specialized AI agents.',
        coreValues: 'Zero-Trust Security, Radical Alignment, High Efficiency, Evidence-based Execution',
        longTermGoals: 'Reach $50M ARR, onboard 2,000 corporate clients, deploy custom GCS pipelines',
        annualObjectives: 'Launch v1.0 core boardroom OS, verify 25 specialist roles in sandbox',
        kpis: 'Active Mission completion rate, token billing margin, response latency'
      });
    }
    if (p.includes('domain: "operations"') || p.includes('domain: operations')) {
      return JSON.stringify({
        businessHours: '24/7/365 continuous autonomous background operations',
        communicationPrefs: 'Asynchronous event-driven updates, WebSocket timeline notifications',
        approvalProcess: 'C-Suite majority consensus for missions, manual overrides by Owner',
        compliance: 'GDPR compliant, SOC 2 Type II audit readiness, data residency overrides'
      });
    }
    if (p.includes('domain: "brand"') || p.includes('domain: brand')) {
      return JSON.stringify({
        brandVoice: 'Professional, authoritative, high-integrity, futuristic',
        toneOfCommunication: 'Confident, precise, informative, and metrics-oriented',
        writingGuidelines: 'Use active voice, precise terms, bullet point summaries, clear definitions',
        primaryColor: '#0A84FF',
        marketingMessages: 'Run your enterprise on Autopilot with a full AI C-Suite board',
        targetAudience: 'Forward-thinking CEOs, Operations directors, Tech founders'
      });
    }
    if (p.includes('domain: "customer"') || p.includes('domain: customer')) {
      return JSON.stringify({
        personas: 'Operational Manager Olivia, Strategic Founder Sam, Compliance Director Carl',
        painPoints: 'Strategic capacity overload, communication blockages, slow project execution',
        buyingJourney: '1-minute onboarding -> Free mission launch -> Active boardroom briefing -> Expansion',
        retentionChallenges: 'Clear validation of ROI, onboarding friction for non-technical users'
      });
    }
    if (p.includes('domain: "market"') || p.includes('domain: market')) {
      return JSON.stringify({
        competitors: 'Standard project management platforms, manual LLM chat interfaces',
        marketTrends: 'Rise of multi-agent orchestration, preference for zero-trust data guards',
        opportunities: 'AI integration with legacy ERP systems, localized compliance layers',
        threats: 'Fast-moving API pricing changes, LLM platform rate limit thresholds'
      });
    }
    if (p.includes('domain: "technology"') || p.includes('domain: technology')) {
      return JSON.stringify({
        coreSoftware: 'Next.js 15, NestJS 10, PostgreSQL, Prisma, Redis/BullMQ',
        integrations: 'Stripe, Slack, GCS Cloud Storage, Gemini API',
        infrastructure: 'Docker containers, multi-region distributed nodes',
        securityRequirements: 'Strict RBAC validation, input prompt sanitization, data encryption'
      });
    }
    if (p.includes('domain: "learning"') || p.includes('domain: learning')) {
      return JSON.stringify({
        recentDecisions: 'Adopted zero-trust sandbox rules, customized CMO branding guidelines',
        approvedInsights: 'Mission completion speed increases by 40% when strategic DAG is pre-planned'
      });
    }

    // CEO strategic plan mocks
    if (
      p.includes('petroleum') ||
      p.includes('oil') ||
      p.includes('logistics')
    ) {
      return JSON.stringify({
        status: 'Approved',
        summary: 'Q3 Petroleum Outreach Proposal aligned with corporate goals.',
        decisions: [
          'Assign Alistair for competitor benchmarking',
          'Assign Linus to build custom templates',
        ],
        recommendations: [
          {
            title: 'West African Corridors Scaling',
            recommendedDirectors: ['Alistair Thorne', 'Rashid Al-Mansoori'],
            confidenceScore: 92,
          },
        ],
      });
    }

    // Default template responses
    return `[Completion generated via ${provider.toUpperCase()}]
System Instructions: ${systemPrompt || 'None'}
Objective Resolved: "${prompt.substring(0, 100)}..."
All compliance standards and zero-trust guidelines verified.`;
  }
}
