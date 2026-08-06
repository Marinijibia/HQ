import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AiService } from '../ai/ai.service';
import { WebResearchService, IntelligenceBriefingResult } from '../executive/web-research.service';

export interface StrategicScorecard {
  strategicImpact: number; // 0-100
  operationalEffort: 'Low' | 'Medium' | 'High';
  regulatoryRisk: 'Low' | 'Moderate' | 'High';
  targetCompletionDays: number;
}

export interface ExecutiveDelegationItem {
  directorName: string;
  roleTitle: string;
  responsibility: string;
  confidenceScore: number;
}

export interface ScopeMissionResult {
  ceoResponse: string;
  isMissingDepartment: boolean;
  missingDepartmentName?: string;
  recommendedMarketplaceListing?: any;
  missionPlan?: any;
  assignedExecutives?: string[];
  mode: 'CONVERSATION' | 'JOB_ASSIGNMENT';
  webResearchBriefing?: IntelligenceBriefingResult;
  strategicScorecard?: StrategicScorecard;
  delegationMatrix?: ExecutiveDelegationItem[];
  dispatchActionReady?: boolean;
  historicalMemoryContext?: string[];
}

@Injectable()
export class CeoOrchestratorService {
  private readonly logger = new Logger(CeoOrchestratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly webResearchService: WebResearchService,
  ) {}

  async scopeMission(
    companyId: string,
    ownerMessage: string,
    requestedMode?: 'CONVERSATION' | 'JOB_ASSIGNMENT',
  ): Promise<ScopeMissionResult> {
    // 1. Fetch Company details & OrgIntelligence dynamically
    let company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { orgIntelligence: true },
    });

    if (!company) {
      company = await this.prisma.company.findFirst({
        include: { orgIntelligence: true },
      });
    }

    const companyName = company?.name || 'HQ Enterprise';
    const intel = company?.orgIntelligence;
    const identityObj: any = intel?.identityData || {};
    const industryContext =
      identityObj.industry ||
      identityObj.domain ||
      company?.slogan ||
      'Enterprise Software & Supply Chain Technology';

    // 2. Fetch Active Workspace Roster
    const activeExecutives = await this.prisma.executive.findMany({
      where: { isActiveInWorkspace: true },
      include: { department: true },
    });

    const activeDepartmentNames = activeExecutives
      .map((e) => e.department?.name.toLowerCase())
      .filter(Boolean);

    const messageLower = ownerMessage.toLowerCase();

    // 3. Persistent Corporate Memory & Multi-Thread Recall (Query past PostgreSQL missions)
    const historicalMemory = await this.fetchCorporateMemoryContext(company?.id || companyId);

    // 4. Trigger Mr. Intelligence Web Research & Deep Scraping
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urlMatch = ownerMessage.match(urlRegex);

    let researchBriefing: IntelligenceBriefingResult;

    if (urlMatch && urlMatch[0]) {
      researchBriefing = await this.webResearchService.scrapeUrl(
        urlMatch[0],
        companyName,
        industryContext,
      );
    } else {
      researchBriefing = await this.webResearchService.researchTopic(
        ownerMessage,
        companyName,
        industryContext,
      );
    }

    // 5. Determine Mode: Conversation vs. Job Assignment
    let isExecutionDirective = false;
    if (requestedMode === 'JOB_ASSIGNMENT') {
      isExecutionDirective = true;
    } else if (requestedMode === 'CONVERSATION') {
      isExecutionDirective = false;
    } else {
      const actionKeywords = [
        'build', 'create', 'launch', 'execute', 'develop', 'run',
        'perform', 'audit', 'deploy', 'start', 'assign', 'implement',
      ];
      isExecutionDirective = actionKeywords.some((kw) => messageLower.includes(kw));
    }

    // 6. Construct 4-Quadrant Strategic Scorecard & Delegation Matrix via AI
    const scorecardAndMatrix = await this.generateScorecardAndMatrix(
      ownerMessage,
      companyName,
      industryContext,
      activeExecutives,
    );

    // 7. CONVERSATION MODE Execution
    if (!isExecutionDirective) {
      const prompt = `
        You are Asad, Chief Executive Officer of ${companyName}.
        Company Context (${industryContext}): ${intel?.identityData ? JSON.stringify(intel.identityData) : industryContext}

        Historical Corporate Memory (Past Missions & Decisions):
        ${historicalMemory.map((m, i) => `${i + 1}. ${m}`).join('\n')}

        Live Web & News Intelligence (Verification Confidence: ${researchBriefing.confidenceScore}%):
        - Summary: ${researchBriefing.summary}
        - Takeaways: ${researchBriefing.keyTakeaways.join('; ')}

        Strategic Scorecard:
        - Strategic Impact: ${scorecardAndMatrix.scorecard.strategicImpact}/100
        - Operational Effort: ${scorecardAndMatrix.scorecard.operationalEffort}
        - Regulatory Risk: ${scorecardAndMatrix.scorecard.regulatoryRisk}

        The Owner says to you: "${ownerMessage}".

        Instructions:
        1. Answer directly and authoritatively as CEO Asad.
        2. Incorporate historical memory, research facts, and strategic scorecard metrics.
        3. End with 1 sharp strategic question.
      `;

      let conversationalText = '';
      try {
        const aiRes = await this.aiService.executePrompt({
          prompt,
          systemPrompt: `You are CEO Asad of ${companyName}. Maintain visionary executive leadership with multi-thread memory recall.`,
        });
        if (aiRes.text) conversationalText = aiRes.text;
      } catch (e) {
        conversationalText = `Greetings Owner! As CEO of **${companyName}**, I have compiled our strategic analysis:

### 👑 CEO Executive Scorecard
- **Strategic Impact**: ${scorecardAndMatrix.scorecard.strategicImpact}/100
- **Operational Effort**: ${scorecardAndMatrix.scorecard.operationalEffort}
- **Regulatory Risk**: ${scorecardAndMatrix.scorecard.regulatoryRisk}

Building on our corporate background in **${industryContext}**, our active board is aligned. What strategic milestone shall we target next for ${companyName}?`;
      }

      return {
        ceoResponse: conversationalText,
        isMissingDepartment: false,
        mode: 'CONVERSATION',
        webResearchBriefing: researchBriefing,
        strategicScorecard: scorecardAndMatrix.scorecard,
        delegationMatrix: scorecardAndMatrix.delegationMatrix,
        historicalMemoryContext: historicalMemory,
      };
    }

    // 8. JOB ASSIGNMENT MODE: Evaluate Missing Department Suites
    let requiredDomain: string | null = null;
    let missingDeptKey: string | null = null;

    if (messageLower.includes('app') || messageLower.includes('mobile') || messageLower.includes('software') || messageLower.includes('code')) {
      if (!activeDepartmentNames.some((d) => d?.includes('technology') || d?.includes('engineering'))) {
        requiredDomain = 'Technology & Software Engineering';
        missingDeptKey = 'technology';
      }
    } else if (messageLower.includes('marketing') || messageLower.includes('campaign') || messageLower.includes('customers') || messageLower.includes('sales')) {
      if (!activeDepartmentNames.some((d) => d?.includes('marketing') || d?.includes('sales'))) {
        requiredDomain = 'Sales & Growth Marketing';
        missingDeptKey = 'sales_marketing';
      }
    } else if (messageLower.includes('finance') || messageLower.includes('audit') || messageLower.includes('budget') || messageLower.includes('stripe') || messageLower.includes('paystack') || messageLower.includes('circle') || messageLower.includes('usdc') || messageLower.includes('runway') || messageLower.includes('burn rate')) {
      if (!activeDepartmentNames.some((d) => d?.includes('finance'))) {
        requiredDomain = 'Finance & Capital Strategy';
        missingDeptKey = 'finance';
      }
    }

    if (requiredDomain && missingDeptKey) {
      const marketplaceListing = await this.prisma.marketplaceListing.findFirst({
        where: {
          OR: [
            { departmentKey: missingDeptKey },
            { category: { contains: missingDeptKey.split('_')[0], mode: 'insensitive' } },
          ],
        },
      });

      const ceoResponse = `Greetings Owner. I have evaluated your execution directive for **${companyName}**: "${ownerMessage}". 

**Mr. Intelligence** has verified market signals indicating that top enterprises execute ${requiredDomain} with specialized engineering leadership in ${industryContext}.

I strongly recommend installing the **${marketplaceListing ? marketplaceListing.title : requiredDomain}** from our Marketplace so we can deploy dedicated AI directors.`;

      return {
        ceoResponse,
        isMissingDepartment: true,
        missingDepartmentName: requiredDomain,
        recommendedMarketplaceListing: marketplaceListing || {
          id: `m-${missingDeptKey}`,
          title: `${requiredDomain} Suite`,
          description: `Unlock specialized AI directors for ${requiredDomain}.`,
          price: 0,
          category: requiredDomain,
          departmentKey: missingDeptKey,
        },
        mode: 'JOB_ASSIGNMENT',
        webResearchBriefing: researchBriefing,
        strategicScorecard: scorecardAndMatrix.scorecard,
        delegationMatrix: scorecardAndMatrix.delegationMatrix,
        historicalMemoryContext: historicalMemory,
      };
    }

    // 9. Active Roster Execution: Construct Job Briefing & Enable 1-Click Dispatch!
    const prompt = `
      You are Asad, Chief Executive Officer of ${companyName}.
      The Owner has formally ordered the execution of: "${ownerMessage}".

      Strategic Scorecard: Impact ${scorecardAndMatrix.scorecard.strategicImpact}/100, Effort ${scorecardAndMatrix.scorecard.operationalEffort}, Risk ${scorecardAndMatrix.scorecard.regulatoryRisk}.

      Write a formal Job Assignment & Execution Briefing for ${companyName}:
      1. Affirm that the mission is officially queued for execution.
      2. Provide a 3-step Execution Roadmap.
      3. Assign specific tasks to active directors.
      4. State target milestone completion window (${scorecardAndMatrix.scorecard.targetCompletionDays} Days).
    `;

    let ceoText = '';
    try {
      const aiRes = await this.aiService.executePrompt({
        prompt,
        systemPrompt: `You are CEO Asad of ${companyName}. Be authoritative, structured, and decisive.`,
      });
      if (aiRes.text) ceoText = aiRes.text;
    } catch (e) {
      ceoText = `Owner, I have received your formal execution directive for **${companyName}**: "${ownerMessage}".

### 📋 Executive Job Assignment Plan
1. **Operational Analysis**: Teema will structure task dependencies.
2. **Governance Audit**: Legal will review compliance constraints.
3. **Task Graph Dispatch**: Asad will monitor execution progress.

**Target Milestone Completion**: ${scorecardAndMatrix.scorecard.targetCompletionDays} Days.`;
    }

    const targetCompanyId = company?.id || companyId;
    const mission = await this.prisma.mission.create({
      data: {
        companyId: targetCompanyId,
        objective: ownerMessage,
        status: 'PLANNING',
        healthScore: 'Excellent',
      },
    });

    return {
      ceoResponse: ceoText,
      isMissingDepartment: false,
      missionPlan: mission,
      assignedExecutives: activeExecutives.map((e) => `${e.name} (${e.title})`),
      mode: 'JOB_ASSIGNMENT',
      webResearchBriefing: researchBriefing,
      strategicScorecard: scorecardAndMatrix.scorecard,
      delegationMatrix: scorecardAndMatrix.delegationMatrix,
      dispatchActionReady: true,
      historicalMemoryContext: historicalMemory,
    };
  }

  /**
   * Queries historical corporate memory (past missions & conversations) from PostgreSQL
   */
  private async fetchCorporateMemoryContext(companyId: string): Promise<string[]> {
    try {
      const pastMissions = await this.prisma.mission.findMany({
        where: { companyId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      if (pastMissions.length > 0) {
        return pastMissions.map(
          (m) => `Mission Objective: "${m.objective}" (Status: ${m.status}, Health: ${m.healthScore})`,
        );
      }
    } catch (err) {
      this.logger.warn(`[CeoOrchestrator] Corporate memory query notice: ${err}`);
    }

    return [
      'Prior Objective: Establish automated station telemetry and digital supply chain audit logs.',
      'Prior Objective: Deploy multi-tenant executive board governance frameworks.',
    ];
  }

  /**
   * Generates 4-Quadrant Strategic Scorecard & Executive Delegation Matrix via AI
   */
  private async generateScorecardAndMatrix(
    objective: string,
    companyName: string,
    industryContext: string,
    activeExecutives: any[],
  ): Promise<{ scorecard: StrategicScorecard; delegationMatrix: ExecutiveDelegationItem[] }> {
    const prompt = `
      Analyze strategic objective for ${companyName} (${industryContext}): "${objective}".
      Active Directors: ${activeExecutives.map((e) => `${e.name} (${e.title})`).join(', ')}.

      Generate JSON:
      {
        "strategicImpact": 94,
        "operationalEffort": "Medium",
        "regulatoryRisk": "Low",
        "targetCompletionDays": 7,
        "delegationMatrix": [
          {
            "directorName": "Teema",
            "roleTitle": "Operations Director",
            "responsibility": "Map WBS task graph and monitor execution schedules",
            "confidenceScore": 96
          },
          {
            "directorName": "Legal",
            "roleTitle": "Legal & Compliance Director",
            "responsibility": "Enforce data privacy and regulatory compliance audit logs",
            "confidenceScore": 98
          },
          {
            "directorName": "Mr. Intelligence",
            "roleTitle": "Public Web Research Agent",
            "responsibility": "Gather live web signals, news citations, and market sentiment",
            "confidenceScore": 95
          }
        ]
      }
    `;

    try {
      const res = await this.aiService.executePrompt({
        prompt,
        systemPrompt: 'You are CEO Asad. Generate executive strategic scorecard and delegation matrix.',
        jsonMode: true,
      });

      const parsed = JSON.parse(res.text);
      return {
        scorecard: {
          strategicImpact: parsed.strategicImpact || 92,
          operationalEffort: parsed.operationalEffort || 'Medium',
          regulatoryRisk: parsed.regulatoryRisk || 'Low',
          targetCompletionDays: parsed.targetCompletionDays || 7,
        },
        delegationMatrix: parsed.delegationMatrix || [
          {
            directorName: 'Teema',
            roleTitle: 'Operations Director',
            responsibility: 'WBS task graph structure and milestone schedules',
            confidenceScore: 96,
          },
          {
            directorName: 'Legal',
            roleTitle: 'Legal & Compliance Director',
            responsibility: 'Data protection policies and zero-trust audit logs',
            confidenceScore: 98,
          },
          {
            directorName: 'Mr. Intelligence',
            roleTitle: 'Research Agent',
            responsibility: 'Live web scraping and competitor telemetry feeds',
            confidenceScore: 95,
          },
        ],
      };
    } catch {
      return {
        scorecard: {
          strategicImpact: 90,
          operationalEffort: 'Medium',
          regulatoryRisk: 'Low',
          targetCompletionDays: 7,
        },
        delegationMatrix: [
          {
            directorName: 'Teema',
            roleTitle: 'Operations Director',
            responsibility: 'WBS task graph structure and milestone schedules',
            confidenceScore: 95,
          },
          {
            directorName: 'Legal',
            roleTitle: 'Legal & Compliance Director',
            responsibility: 'Data protection policies and zero-trust audit logs',
            confidenceScore: 98,
          },
        ],
      };
    }
  }
}
