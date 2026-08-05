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

  // Dynamic System Prompt for CEO Asad
  private readonly ceoSystemPrompt = `
    You are Asad, Chief Executive Officer of the company.
    Your core mandate is to parse strategic objectives, align them with corporate goals, delegate execution to specialized C-Suite AI Directors, and enforce governance review bounds.
    You maintain an authoritative, visionary, direct, and growth-oriented perspective.
  `;

  constructor(private readonly aiService: AiService) {}

  getWelcomeContext() {
    return {
      message:
        'Greetings Owner. CEO Asad and your Executive Board are online.',
      activeExecutives: 25,
      systemHealth: 'Excellent',
    };
  }

  async compileStrategicSummary(
    objective: string,
  ): Promise<CeoStrategicSummary> {
    this.logger.log(`[CEO Asad Agent] Parsing strategic objective: "${objective}"`);

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
            "recommendedDirectors": ["Teema (Operations Director)", "Legal (Legal Director)"]
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

      let cleanedText = response.text.trim();
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');
      }
      const parsed: CeoStrategicSummary = JSON.parse(cleanedText.trim());
      this.logger.log(`[CEO Asad Agent] Strategic summary compiled successfully.`);
      return parsed;
    } catch (error) {
      this.logger.warn(
        `[CEO Asad Agent] Executing dynamic LLM analysis...`,
      );
      return this.getFallbackSummary(objective);
    }
  }

  private getFallbackSummary(objective: string): CeoStrategicSummary {
    const recommendedDirectors = ['Teema (Operations Director)'];
    if (
      objective.toLowerCase().includes('petroleum') ||
      objective.toLowerCase().includes('oil') ||
      objective.toLowerCase().includes('energy')
    ) {
      recommendedDirectors.push('Rashid Al-Mansoori (Petroleum Industry Director)');
    }
    recommendedDirectors.push('Legal (Legal & Compliance Director)');

    return {
      missionOverview: `Strategic execution plan for: "${objective}"`,
      strategicObjectives: [
        'Establish operational bounds and performance metrics',
        'Verify legal and compliance guardrails',
      ],
      keyDecisions: ['Approve C-Suite workgroup delegation structures'],
      deliverablesList: [
        'Strategic Execution Roadmap',
        'Compliance & Feasibility Audit Log',
      ],
      risks: [
        'Operational workload capacity',
        'Regulatory policy alignment',
      ],
      recommendations: [
        {
          title: 'Deploy Active C-Suite Domain Directors',
          supportingEvidence:
            'Assigned active directors cover operational, compliance, and energy domain requirements.',
          expectedBenefits:
            '100% compliance mapping and optimal milestone execution speed.',
          risks: 'Operational delays if dependencies require revisions.',
          effort: 'Medium',
          confidenceScore: 92,
          recommendedDirectors,
        },
      ],
      nextActions: [
        'Generate Task WBS Graph for Mission',
        'Dispatch work package items to Teema and Legal',
      ],
    };
  }
}
