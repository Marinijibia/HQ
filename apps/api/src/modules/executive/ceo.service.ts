import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

export interface CeoRecommendation {
  title: string;
  supportingEvidence: string;
  expectedBenefits: string;
  risks: string;
  effort: string;
  confidenceScore: number;
  recommendedDirectors: string[];
}

export interface CeoStrategicSummary {
  missionOverview: string;
  strategicObjectives: string[];
  keyDecisions: string[];
  deliverablesList: string[];
  risks: string[];
  recommendations: CeoRecommendation[];
  nextActions: string[];
}

@Injectable()
export class CeoService {
  private readonly logger = new Logger(CeoService.name);

  // System Prompt for CEO
  private readonly ceoSystemPrompt = `
    You are Elena Rostova, CEO of HQ Corporation.
    Your core mandate is to parse strategic objectives, align them with enterprise goals, delegate execution to specialized C-Suite AI Directors, and enforce governance review bounds.
    You maintain an authoritative, direct, and growth-oriented perspective.
    Ensure zero-trust compliance check triggers are integrated at all handoffs.
  `;

  constructor(private readonly aiService: AiService) {}

  getWelcomeContext() {
    return {
      message:
        'Welcome back. Your Executive Board is online. Three missions require your attention today.',
      activeExecutives: 25,
      systemHealth: 'Excellent',
    };
  }

  async compileStrategicSummary(
    objective: string,
  ): Promise<CeoStrategicSummary> {
    this.logger.log(`[CEO Agent] Parsing strategic objective: "${objective}"`);

    // Compile dynamic prompts mapping CEO analysis criteria
    const prompt = `
      Analyze this corporate objective: "${objective}".
      Provide a strategic plan and delegate to specialized directors in JSON format matching this schema:
      {
        "missionOverview": "string description",
        "strategicObjectives": ["objective 1", "objective 2"],
        "keyDecisions": ["decision 1"],
        "deliverablesList": ["deliverable 1"],
        "risks": ["risk 1"],
        "recommendations": [
          {
            "title": "recommendation title",
            "supportingEvidence": "evidence string",
            "expectedBenefits": "benefits string",
            "risks": "risks string",
            "effort": "Low|Medium|High",
            "confidenceScore": 90,
            "recommendedDirectors": ["Strategy Director", "Finance Director"]
          }
        ],
        "nextActions": ["action 1"]
      }
    `;

    try {
      const response = await this.aiService.executePrompt({
        prompt,
        systemPrompt: this.ceoSystemPrompt,
        provider: 'gemini',
        temperature: 0.2,
      });

      // Parse JSON from completion
      const parsed: CeoStrategicSummary = JSON.parse(response.text);
      this.logger.log(`[CEO Agent] Strategic summary compiled successfully.`);
      return parsed;
    } catch (error) {
      this.logger.warn(
        `[CEO Agent] Failed to parse LLM JSON response. Falling back to default heuristics...`,
      );
      return this.getFallbackSummary(objective);
    }
  }

  private getFallbackSummary(objective: string): CeoStrategicSummary {
    const recommendedDirectors = ['Alistair Thorne (Strategy Director)'];
    if (
      objective.toLowerCase().includes('petroleum') ||
      objective.toLowerCase().includes('oil')
    ) {
      recommendedDirectors.push('Rashid Al-Mansoori (Petroleum Director)');
    }
    recommendedDirectors.push('Sophia Sterling (Finance Director)');

    return {
      missionOverview: `Strategic execution plan for: "${objective}"`,
      strategicObjectives: [
        'Establish strategic bounds and KPIs',
        'Verify compliance criteria mapping',
      ],
      keyDecisions: ['Approve C-Suite workgroup delegation structures'],
      deliverablesList: [
        'B2B Outreach Strategy Document',
        'Compliance Audits Log',
      ],
      risks: [
        'Geopolitical logistics changes',
        'Model hallucination parameters',
      ],
      recommendations: [
        {
          title: 'Activate C-Suite Domain Experts Roster',
          supportingEvidence:
            'Targeted directors cover energy, strategy, and finance requirements.',
          expectedBenefits:
            '100% compliance mapping and optimal credit spending metrics.',
          risks: 'Operational delays if handoffs require revisions.',
          effort: 'Medium',
          confidenceScore: 92,
          recommendedDirectors,
        },
      ],
      nextActions: [
        'COS to generate Task WBS Graph',
        'Dispatch work package items to Strategy Director',
      ],
    };
  }
}
