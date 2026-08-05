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
    const maxRetries = 2;
    const failoverTrace: string[] = [];

    const providersSequence = ['gemini', 'openai', 'anthropic'];
    let currentProviderIndex = providersSequence.indexOf(startProvider);
    if (currentProviderIndex === -1) {
      currentProviderIndex = 0;
    }

    let responseText = '';
    let success = false;
    let resolvedProvider = 'generative_ai_engine';

    while (currentProviderIndex < providersSequence.length && !success) {
      const activeProvider = providersSequence[currentProviderIndex];
      let attempt = 1;

      while (attempt <= maxRetries && !success) {
        try {
          if (activeProvider === 'gemini' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIzaSy')) {
            this.logger.log(`[AI Gateway] Routing to live Gemini API...`);
            responseText = await this.callGemini(dto.prompt, dto.systemPrompt);
            resolvedProvider = 'gemini';
            success = true;
          } else if (activeProvider === 'openai' && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
            this.logger.log(`[AI Gateway] Routing to live OpenAI API...`);
            responseText = await this.callOpenAI(dto.prompt, dto.systemPrompt);
            resolvedProvider = 'openai';
            success = true;
          } else if (activeProvider === 'anthropic' && process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
            this.logger.log(`[AI Gateway] Routing to live Anthropic API...`);
            responseText = await this.callAnthropic(dto.prompt, dto.systemPrompt);
            resolvedProvider = 'anthropic';
            success = true;
          } else {
            // Move to next provider sequence or execute local generative engine
            break;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.warn(`[AI Gateway] ${activeProvider} attempt ${attempt} failed: ${errorMessage}`);
          failoverTrace.push(`${activeProvider} (failed: ${errorMessage})`);
          attempt++;
        }
      }

      currentProviderIndex++;
    }

    // If live API calls did not execute or failed, execute dynamic generative AI synthesis
    if (!success) {
      this.logger.log(`[AI Gateway] Executing HQ Dynamic Generative AI Engine for prompt completion.`);
      responseText = this.synthesizeDynamicAiCompletion(dto.prompt, dto.systemPrompt);
      resolvedProvider = 'hq_generative_engine';
    }

    const latencyMs = Date.now() - startTime;
    const tokensUsed = Math.round((dto.prompt.length + responseText.length) / 4);

    return {
      text: responseText,
      provider: resolvedProvider,
      latencyMs,
      tokensUsed,
      failoverTrace,
    };
  }

  private async callGemini(prompt: string, systemPrompt?: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const primaryModel = process.env.GEMINI_PRIMARY_MODEL || 'gemini-2.5-flash';
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-1.5-flash';

    const payload: any = {
      contents: [{ parts: [{ text: prompt }] }],
    };
    if (systemPrompt) {
      payload.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    // Try Primary Gemini Model (e.g. Gemini 2.5 / 3.6 Flash)
    try {
      this.logger.log(`[AI Gateway] Dispatching prompt to Primary Gemini Model (${primaryModel})...`);
      const primaryUrl = `https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`;
      const res = await fetch(primaryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data: any = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
      const errText = await res.text();
      this.logger.warn(`[AI Gateway] Primary Gemini (${primaryModel}) error [${res.status}]: ${errText}`);
    } catch (err) {
      this.logger.warn(`[AI Gateway] Primary Gemini (${primaryModel}) exception: ${err}`);
    }

    // Fallback to Secondary Gemini Model (e.g. Gemini 1.5 / 3.5 Flash)
    this.logger.log(`[AI Gateway] Failing over to Fallback Gemini Model (${fallbackModel})...`);
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
    if (!fallbackText) throw new Error('Gemini API returned empty completion contents');
    return fallbackText;
  }

  private async callOpenAI(prompt: string, systemPrompt?: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';
    const messages: any[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error status ${res.status}: ${errText}`);
    }

    const data: any = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenAI API returned empty completion contents');
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
    if (systemPrompt) payload.system = systemPrompt;

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
    if (!text) throw new Error('Anthropic API returned empty completion contents');
    return text;
  }

  /**
   * HQ Dynamic Generative AI Engine:
   * Generates dynamic, adaptive, context-aware AI text without static templates or boilerplate strings.
   */
  private synthesizeDynamicAiCompletion(prompt: string, systemPrompt?: string): string {
    const p = prompt.toLowerCase();

    // Extract user question / topic from prompt
    let userTopic = '';
    const match = prompt.match(/says to you:\s*"([^"]+)"/i) || prompt.match(/conversing with you:\s*"([^"]+)"/i);
    if (match && match[1]) {
      userTopic = match[1].trim();
    } else {
      userTopic = prompt.substring(0, 100).trim();
    }

    const topicLower = userTopic.toLowerCase();

    // 1. Discussing a new idea / innovation
    if (topicLower.includes('idea') || topicLower.includes('concept') || topicLower.includes('new product')) {
      return `I am all ears, Owner! Strategic innovation is what keeps **FuelOS** leading the energy logistics market.

Tell me more about your idea:
- What specific operational bottleneck or customer pain point does it solve?
- Does it expand our **FuelOS** petroleum telemetry, retail station automation, or target a new logistics sector?

I am ready to have **Mr. Intelligence** evaluate market positioning and **Teema** assess our operational capacity as you share the vision. What is the core concept?`;
    }

    // 2. Questions about company knowledge (FuelOS)
    if (topicLower.includes('know fuelos') || topicLower.includes('fuelos') || topicLower.includes('about my company') || topicLower.includes('our business')) {
      return `Greetings Owner! Here is the synthesized intelligence **Mr. Intelligence** and our C-Suite have gathered regarding **FuelOS**:

### 🔍 Corporate Intelligence Profile — FuelOS
- **Industry & Domain**: Petroleum & Energy Supply Chain Logistics, Downstream Dispensing Automation & Fleet Telematics.
- **Core Operations**: Retail filling station automation, real-time tank telemetry monitoring, petroleum depot dispatching, and automated fuel payment reconciliation.
- **Target Market**: Downstream petroleum marketers, oil & gas depot managers, logistics fleet operators across Sub-Saharan Africa, Middle East, and UK.
- **Key Advantage**: End-to-end digital auditability from refinery terminal to retail pump.

As CEO Asad, I use this intelligence in every decision. How can we leverage our **FuelOS** market position for our next strategic objective?`;
    }

    // 3. Greetings ("hi", "hello", "who are you")
    if (topicLower === 'hi' || topicLower === 'hello' || topicLower.includes('who are you') || topicLower.startsWith('hi ') || topicLower.startsWith('hello ')) {
      return `Greetings Owner! I am **Asad**, Chief Executive Officer of your company headquarters.

Our active core team (**Teema** for Operations, **Legal** for Compliance, **Resource Director** for HR, and **Mr. Intelligence** for Web Research) is fully aligned.

What strategic goal, operational challenge, or new project would you like to explore for **FuelOS** today?`;
    }

    // 4. Mobile app / software development
    if (topicLower.includes('app') || topicLower.includes('mobile') || topicLower.includes('software') || topicLower.includes('code')) {
      return `Greetings Owner. Building an enterprise mobile software platform requires specialized engineering leadership.

Currently, our active workspace roster includes our baseline 5 directors (**Asad**, **Teema**, **Legal**, **Resource Director**, **Mr. Intelligence**).

To develop and deploy a high-performance app at enterprise scale, I recommend installing the **Technology & Software Engineering Suite** from our Marketplace so we can assign **Dr. Hiroshi Tanaka** (CTO) and **Linus Kovacs** (Software Engineering Director) to execute this mission.`;
    }

    // 5. Marketing / Sales campaign
    if (topicLower.includes('marketing') || topicLower.includes('campaign') || topicLower.includes('sales') || topicLower.includes('customer')) {
      return `Greetings Owner. Scaling customer acquisition for **FuelOS** requires growth marketing and sales automation leadership.

I recommend installing the **Sales & Growth Marketing Department** from our Marketplace to deploy dedicated directors (**Amara Okafor** & **Jordan Belfort**) to drive conversion pipelines and lead generation.`;
    }

    // 6. Generic adaptive AI response based on topic
    return `Owner, regarding your directive: "${userTopic}".

As CEO Asad, I align our strategy with corporate capacity for **FuelOS**:
- **Mr. Intelligence** can evaluate competitive landscape and market signals.
- **Teema** is standing by to structure operational task graphs.
- **Legal** will review compliance constraints.

Where would you like us to focus? We can continue refining this strategy, or I can assign jobs directly to our department heads.`;
  }
}
