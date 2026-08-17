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
    You are the Chief Copywriting Director at HQ Corporation.
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
      `[Copywriter Engine] Spawning copywriting request via AI Engine. Tone: ${tone}, Limit: ${lengthLimit}`,
    );

    const compiledPrompt = `
      Write high-converting marketing copy for this directive: "${prompt}".
      Tone style guideline: "${tone}".
      Character limit boundary: ${lengthLimit} characters.

      Return the result in JSON format matching this schema:
      {
        "text": "The main copy content goes here",
        "seoTitle": "Recommended Page Title (Max 60 chars)",
        "seoDescription": "Recommended Meta Description (Max 160 chars)"
      }
    `;

    const response = await this.aiService.executePrompt({
      prompt: compiledPrompt,
      systemPrompt: this.copywriterSystemPrompt,
    });

    let text = response.text;
    let seoTitle = 'HQ Enterprise Campaign';
    let seoDescription = 'HQ AI Operating System strategic marketing asset.';

    try {
      const parsed = JSON.parse(response.text);
      if (parsed.text) text = parsed.text;
      if (parsed.seoTitle) seoTitle = parsed.seoTitle;
      if (parsed.seoDescription) seoDescription = parsed.seoDescription;
    } catch {
      // If output is raw string, use live AI completion text directly
      this.logger.log(
        '[Copywriter Engine] Live response format parsed as raw text completion.',
      );
    }

    return {
      text,
      charCount: text.length,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      seoTitle,
      seoDescription,
      tone,
    };
  }
}
