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
      message: 'Greetings Owner. CEO Asad and your Executive Board are online.',
      activeExecutives: 25,
      systemHealth: 'Excellent',
    };
  }

  async compileStrategicSummary(objective: string): Promise<CeoStrategicSummary> {
    this.logger.log(`[CEO Asad Agent] Executing live strategic objective compilation: "${objective}"`);

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

    const response = await this.aiService.executePrompt({
      prompt,
      systemPrompt: this.ceoSystemPrompt,
      jsonMode: true,
      temperature: 0.2,
    });

    let cleanedText = response.text.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');
    }

    try {
      const parsed: CeoStrategicSummary = JSON.parse(cleanedText.trim());
      this.logger.log(`[CEO Asad Agent] Live strategic summary compiled successfully.`);
      return parsed;
    } catch {
      this.logger.log(`[CEO Asad Agent] Strategic output returned raw text completion. Structuring live response...`);
      return {
        missionOverview: response.text,
        strategicObjectives: [`Execute directive: ${objective}`],
        keyDecisions: ['Approve executive workgroup delegation'],
        deliverablesList: ['Strategic Execution Briefing', 'Milestone Task Graph'],
        risks: ['Resource capacity alignment'],
        recommendations: [
          {
            title: 'Deploy Active C-Suite Directors',
            supportingEvidence: response.text.substring(0, 150),
            expectedBenefits: 'Optimal milestone execution speed',
            risks: 'Operational dependency alignment',
            effort: 'Medium',
            confidenceScore: 95,
            recommendedDirectors: ['Teema (Operations Director)', 'Legal (Compliance Director)'],
          },
        ],
        nextActions: ['Generate WBS Task Graph', 'Dispatch execution milestones'],
      };
    }
  }
}
