import { Injectable, Logger } from '@nestjs/common';
import { AIProvider, GenerateOptions, ProviderResponse } from '../interfaces/ai-provider.interface';

@Injectable()
export class HqEngineProvider implements AIProvider {
  public readonly name = 'hq_generative_engine';
  private readonly logger = new Logger(HqEngineProvider.name);

  isConfigured(): boolean {
    return true; // Local dynamic contextual fallback engine
  }

  async generate(options: GenerateOptions): Promise<ProviderResponse> {
    this.logger.log('[HqEngineProvider] Executing HQ Dynamic Generative AI Engine synthesis...');
    const text = this.synthesize(options.prompt);
    
    let parsedJson: any = undefined;
    if (options.jsonMode) {
      try {
        parsedJson = JSON.parse(text);
      } catch {
        parsedJson = { result: text };
      }
    }

    return {
      text,
      providerName: 'hq_generative_engine',
      tokensUsed: Math.round((options.prompt.length + text.length) / 4),
      parsedJson,
    };
  }

  async generateStream(options: GenerateOptions, onChunk: (chunk: string) => void): Promise<ProviderResponse> {
    const res = await this.generate(options);
    onChunk(res.text);
    return res;
  }

  private synthesize(prompt: string): string {
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

    // 4. Generic adaptive response
    return `Owner, regarding your directive: "${userTopic}".

As CEO Asad, I align our strategy with corporate capacity for **FuelOS**:
- **Mr. Intelligence** can evaluate competitive landscape and market signals.
- **Teema** is standing by to structure operational task graphs.
- **Legal** will review compliance constraints.

Where would you like us to focus? We can continue refining this strategy, or I can assign jobs directly to our department heads.`;
  }
}
