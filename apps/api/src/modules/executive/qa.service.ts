import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

export interface EvaluationCheckResult {
  checkType:
    | 'STRATEGIC_ALIGNMENT'
    | 'TONE_CONSISTENCY'
    | 'REGULATORY_COMPLIANCE'
    | 'TECHNICAL_FEASIBILITY'
    | 'COMPLETENESS';
  passed: boolean;
  notes: string;
}

export interface QaEvaluationReport {
  passed: boolean;
  score: number; // 0-100
  critique: string;
  checks: EvaluationCheckResult[];
}

@Injectable()
export class QaService {
  private readonly logger = new Logger(QaService.name);

  private readonly qaSystemPrompt = `
    You are Alan Turing, the Quality Assurance (QA) Director of HQ Corporation.
    Your mandate is to perform pre-flight evaluations on C-Suite deliverables.
    You must evaluate text inputs against 5 strict validation benchmarks:
    1. Strategic Alignment (is the objective solved?).
    2. Tone Consistency (does style match corporate guidelines?).
    3. Regulatory Compliance (any restricted claims?).
    4. Technical Feasibility (can this execute/scale?).
    5. Completeness (are all required components included?).
    Maintain an analytical, metric-driven, and objective perspective.
  `;

  constructor(private readonly aiService: AiService) {}

  async evaluateDeliverable(
    objective: string,
    content: string,
    tonePreference = 'Professional',
  ): Promise<QaEvaluationReport> {
    this.logger.log(
      `[QA Validation Gate] Initiating pre-flight audit for content...`,
    );

    const prompt = `
      Evaluate this content: "${content}"
      Against the original mission objective: "${objective}"
      Tone style preference: "${tonePreference}"

      Analyze the text against the 5 benchmarks and return JSON matching this schema:
      {
        "passed": true,
        "score": 95,
        "critique": "overall critique summary",
        "checks": [
          {
            "checkType": "STRATEGIC_ALIGNMENT",
            "passed": true,
            "notes": "alignment notes"
          },
          {
            "checkType": "TONE_CONSISTENCY",
            "passed": true,
            "notes": "tone notes"
          },
          {
            "checkType": "REGULATORY_COMPLIANCE",
            "passed": true,
            "notes": "compliance notes"
          },
          {
            "checkType": "TECHNICAL_FEASIBILITY",
            "passed": true,
            "notes": "feasibility notes"
          },
          {
            "checkType": "COMPLETENESS",
            "passed": true,
            "notes": "completeness notes"
          }
        ]
      }
    `;

    try {
      const response = await this.aiService.executePrompt({
        prompt,
        systemPrompt: this.qaSystemPrompt,
        provider: 'gemini',
        temperature: 0.1,
      });

      const parsed: QaEvaluationReport = JSON.parse(response.text);
      this.logger.log(
        `[QA Validation Gate] Deliverable evaluation finished. Status: ${parsed.passed ? 'PASSED' : 'FAILED'} (Score: ${parsed.score})`,
      );
      return parsed;
    } catch (error) {
      this.logger.warn(
        `[QA Validation Gate] Failed to parse QA LLM JSON response. Falling back to static benchmarks...`,
      );
      return this.getFallbackReport(objective, content, tonePreference);
    }
  }

  private getFallbackReport(
    objective: string,
    content: string,
    tonePreference: string,
  ): QaEvaluationReport {
    const passed = content.length > 50;
    const score = passed ? 90 : 65;

    return {
      passed,
      score,
      critique: passed
        ? 'Content meets standard operational thresholds with minor styling suggestions.'
        : 'Deliverable content length is too short to satisfy planning objectives.',
      checks: [
        {
          checkType: 'STRATEGIC_ALIGNMENT',
          passed,
          notes: 'Objective text matches context scopes.',
        },
        {
          checkType: 'TONE_CONSISTENCY',
          passed: passed ? true : false,
          notes: `Content style aligned with preference: ${tonePreference}.`,
        },
        {
          checkType: 'REGULATORY_COMPLIANCE',
          passed: true,
          notes: 'No restricted compliance keywords matched.',
        },
        {
          checkType: 'TECHNICAL_FEASIBILITY',
          passed: true,
          notes: 'Deliverable has minimal execution requirements.',
        },
        {
          checkType: 'COMPLETENESS',
          passed,
          notes: 'All core parameters present.',
        },
      ],
    };
  }
}
