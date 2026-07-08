import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';

export interface GeneratedCopyResult {
  text: string;
  charCount: number;
  wordCount: number;
  seoTitle?: string;
  seoDescription?: string;
  tone: string;
}

@Injectable()
export class CopywriterService {
  private readonly logger = new Logger(CopywriterService.name);

  private readonly copywriterSystemPrompt = `
    You are Alistair Thorne, the Chief Copywriting Director at HQ Corporation.
    Your mandate is to craft high-conversion B2B/B2C marketing campaigns, blog drafts, templates, and social copy.
    Ensure all copy is engaging, grammatically flawless, and strictly aligned with designated brand guidelines.
    Always provide recommended SEO title tags and meta descriptions along with campaign copy.
  `;

  constructor(private readonly aiService: AiService) {}

  async generateCopywritingDraft(
    prompt: string,
    tone = 'Professional',
    lengthLimit = 500,
  ): Promise<GeneratedCopyResult> {
    this.logger.log(
      `[Copywriter Engine] Spawning copywriting request. Tone: ${tone}, Limit: ${lengthLimit}`,
    );

    const compiledPrompt = `
      Write marketing copy for this prompt: "${prompt}".
      Tone style guideline: "${tone}".
      Character limit boundary: ${lengthLimit} characters.

      Return the result in JSON format matching this schema:
      {
        "text": "The main copy content goes here",
        "seoTitle": "Recommended Page Title (Max 60 chars)",
        "seoDescription": "Recommended Meta Description (Max 160 chars)"
      }
    `;

    try {
      const response = await this.aiService.executePrompt({
        prompt: compiledPrompt,
        systemPrompt: this.copywriterSystemPrompt,
        provider: 'gemini',
        temperature: 0.7,
      });

      const parsed = JSON.parse(response.text);
      const text = parsed.text || response.text;

      return {
        text,
        charCount: text.length,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        seoTitle: parsed.seoTitle || 'HQ Campaign Deliverable',
        seoDescription:
          parsed.seoDescription || 'HQ enterprise strategic marketing asset.',
        tone,
      };
    } catch (error) {
      this.logger.warn(
        `[Copywriter Engine] Failed to parse JSON copywriter response. Falling back to default copy formats...`,
      );
      return this.getFallbackCopy(prompt, tone);
    }
  }

  private getFallbackCopy(prompt: string, tone: string): GeneratedCopyResult {
    const text = `[Campaign Copywriting Draft - Tone: ${tone}]
Objective: "${prompt}"

Welcome to HQ Enterprise. Our strategic execution frameworks help C-Suite executives automate alignment checks, design compliance gates, and monitor task queue flows in real-time. Contact our advisory board to schedule your corporate walkthrough today.`;

    return {
      text,
      charCount: text.length,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      seoTitle: 'HQ Corporation: Enterprise Orchestration Platforms',
      seoDescription:
        'Scale your team output with autonomous C-Suite routing agents.',
      tone,
    };
  }
}
