import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';

export interface GeneratedImageResult {
  url?: string;
  provider: string;
  size: string;
  revisedPrompt: string;
  designSpecs?: string;
}

@Injectable()
export class DesignerService {
  private readonly logger = new Logger(DesignerService.name);

  private readonly designerSystemPrompt = `
    You are Linus Kovacs, Creative & Design Director at HQ Corporation.
    Your mandate is to craft high-conversion B2B/B2C landing page visual systems, UI layout structures, color schemes, and visual asset specifications.
    All design concepts must be modern, sleek, use high-contrast dark/light mode aesthetics, and follow zero-trust UX guidelines.
  `;

  constructor(private readonly aiService: AiService) {}

  async generateImage(
    prompt: string,
    size = '1024x1024',
  ): Promise<GeneratedImageResult> {
    this.logger.log(
      `[Designer Engine] Dispatching design synthesis prompt to AI Engine: "${prompt}"`,
    );

    const compiledPrompt = `
      Design an enterprise UI visual specification and artwork generation prompt for: "${prompt}".
      Target aspect resolution: ${size}.

      Provide:
      1. A detailed revised visual generation prompt for AI rendering engines.
      2. Comprehensive design specifications (color tokens, layout hierarchy, UX component structure).

      Return the result in JSON format:
      {
        "revisedPrompt": "Detailed visual rendering prompt",
        "designSpecs": "Comprehensive design specification text"
      }
    `;

    const response = await this.aiService.executePrompt({
      prompt: compiledPrompt,
      systemPrompt: this.designerSystemPrompt,
    });

    let revisedPrompt = prompt;
    let designSpecs = response.text;

    try {
      const parsed = JSON.parse(response.text);
      if (parsed.revisedPrompt) revisedPrompt = parsed.revisedPrompt;
      if (parsed.designSpecs) designSpecs = parsed.designSpecs;
    } catch {
      // Use raw live completion text directly
      designSpecs = response.text;
    }

    return {
      provider: response.provider,
      size,
      revisedPrompt,
      designSpecs,
    };
  }
}
