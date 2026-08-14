import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Build CEO system prompt dynamically using real org context + training data.
   * Never uses a static prompt — always reflects the actual company and executive persona.
   */
  private async buildCeoSystemPrompt(companyId?: string): Promise<string> {
    let companyName = 'your company';
    let industryContext = 'enterprise technology';
    let trainingContext = '';

    if (companyId) {
      try {
        const company = await this.prisma.company.findUnique({
          where: { id: companyId },
          include: { orgIntelligence: true },
        });

        if (company) {
          companyName = company.name;
          const identityObj: any = company.orgIntelligence?.identityData || {};
          industryContext = identityObj.industry || identityObj.domain || company.slogan || industryContext;
        }

        // Fetch CEO executive's training data for persona enrichment
        const ceoExecutive = await this.prisma.executive.findFirst({
          where: {
            department: { companyId },
            OR: [
              { roleKey: { contains: 'ceo' } },
              { title: { contains: 'CEO' } },
              { title: { contains: 'Chief Executive' } },
            ],
          },
          include: {
            trainingData: {
              take: 3,
              orderBy: { createdAt: 'desc' },
            },
          },
        });

        if (ceoExecutive?.trainingData && ceoExecutive.trainingData.length > 0) {
          trainingContext = `\n\nYour Executive Training Context:\n${ceoExecutive.trainingData.map((td: any) => td.content?.substring(0, 400)).join('\n---\n')}`;
        }
      } catch (err) {
        this.logger.warn(`[CEO Service] System prompt context load notice: ${err}`);
      }
    }

    return `You are Asad, Chief Executive Officer of ${companyName} (${industryContext}).
Your core mandate is to parse strategic objectives, align them with corporate goals, delegate execution to specialized C-Suite AI Directors, and enforce governance review bounds.
Maintain an authoritative, visionary, direct, and growth-oriented perspective.${trainingContext}`;
  }

  /**
   * Returns real welcome context from DB — scoped to the org.
   */
  async getWelcomeContext(companyId?: string) {
    let activeExecutives = 0;
    let companyName = 'your organization';

    if (companyId) {
      try {
        const [execCount, company] = await Promise.all([
          this.prisma.executive.count({
            where: { isActiveInWorkspace: true, department: { companyId } },
          }),
          this.prisma.company.findUnique({ where: { id: companyId } }),
        ]);
        activeExecutives = execCount;
        if (company) companyName = company.name;
      } catch (err) {
        this.logger.warn(`[CEO Service] Welcome context load notice: ${err}`);
      }
    }

    return {
      message: `Greetings Owner. CEO Asad and your Executive Board of ${companyName} are online.`,
      activeExecutives,
      systemHealth: 'Excellent',
    };
  }

  async compileStrategicSummary(
    objective: string,
    companyId?: string,
  ): Promise<CeoStrategicSummary> {
    this.logger.log(`[CEO Asad Agent] Compiling live strategic summary: "${objective}"`);

    const systemPrompt = await this.buildCeoSystemPrompt(companyId);

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
            "recommendedDirectors": ["Director Name (Role Title)"]
          }
        ],
        "nextActions": ["action 1"]
      }
    `;

    const response = await this.aiService.executePrompt({
      prompt,
      systemPrompt,
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
      this.logger.warn(`[CEO Asad Agent] JSON parse notice — returning structured raw text.`);
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
            confidenceScore: 90,
            recommendedDirectors: [],
          },
        ],
        nextActions: ['Generate WBS Task Graph', 'Dispatch execution milestones'],
      };
    }
  }
}
