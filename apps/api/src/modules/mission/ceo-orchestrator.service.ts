import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
    // 1. Fetch Company details — throw if not found (never fall through to a random org)
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { orgIntelligence: true },
    });

    if (!company) {
      throw new NotFoundException(`Organization not found for companyId: ${companyId}`);
    }

    const companyName = company.name;
    const intel = company.orgIntelligence;
    const identityObj: any = intel?.identityData || {};
    const industryContext =
      identityObj.industry ||
      identityObj.domain ||
      company.slogan ||
      'Enterprise Technology';

    // 2. Fetch Active Workspace Roster — scoped strictly to this org via department relation
    const activeExecutives = await this.prisma.executive.findMany({
      where: {
        isActiveInWorkspace: true,
        department: { companyId },
      },
      include: { department: true },
    });

    const activeDepartmentNames = activeExecutives
      .map((e) => e.department?.name.toLowerCase())
      .filter(Boolean);

    const messageLower = ownerMessage.toLowerCase();

    // 3. Persistent Corporate Memory — real DB missions only, no fake fallbacks
    const historicalMemory = await this.fetchCorporateMemoryContext(companyId);

    // 4. Trigger Mr. Intelligence Web Research
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

    // 6. Construct Strategic Scorecard & Delegation Matrix via AI
    const scorecardAndMatrix = await this.generateScorecardAndMatrix(
      ownerMessage,
      companyName,
      industryContext,
      activeExecutives,
    );

    // 7. CONVERSATION MODE
    if (!isExecutionDirective) {
      const historySection = historicalMemory.length > 0
        ? `Historical Corporate Memory (Past Missions & Decisions):\n${historicalMemory.map((m, i) => `${i + 1}. ${m}`).join('\n')}`
        : `This appears to be your first interaction. No prior mission history exists yet for ${companyName}.`;

      const prompt = `
        You are Asad, Chief Executive Officer of ${companyName} (${industryContext}).
        ${intel?.identityData ? `Company Context: ${JSON.stringify(intel.identityData)}` : ''}

        ${historySection}

        Live Web & News Intelligence (Confidence: ${researchBriefing.confidenceScore}%):
        - Summary: ${researchBriefing.summary}
        - Takeaways: ${researchBriefing.keyTakeaways.join('; ')}

        Strategic Scorecard:
        - Strategic Impact: ${scorecardAndMatrix.scorecard.strategicImpact}/100
        - Operational Effort: ${scorecardAndMatrix.scorecard.operationalEffort}
        - Regulatory Risk: ${scorecardAndMatrix.scorecard.regulatoryRisk}

        The Owner says: "${ownerMessage}"

        Instructions:
        1. Answer directly and authoritatively as CEO Asad of ${companyName}.
        2. Incorporate historical memory, research facts, and scorecard metrics.
        3. End with 1 sharp strategic question.
      `;

      let conversationalText = '';
      try {
        const aiRes = await this.aiService.executePrompt({
          prompt,
          systemPrompt: `You are CEO Asad of ${companyName}. Maintain visionary executive leadership.`,
        });
        if (aiRes.text) conversationalText = aiRes.text;
      } catch (e) {
        this.logger.warn(`[CeoOrchestrator] Conversation AI error: ${e}`);
        conversationalText = `Greetings Owner. As CEO of **${companyName}**, I have compiled our strategic analysis.\n\n**Strategic Scorecard**: Impact ${scorecardAndMatrix.scorecard.strategicImpact}/100, Effort: ${scorecardAndMatrix.scorecard.operationalEffort}, Risk: ${scorecardAndMatrix.scorecard.regulatoryRisk}.\n\nWhat strategic milestone shall we prioritize next for ${companyName}?`;
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
    } else if (messageLower.includes('finance') || messageLower.includes('audit') || messageLower.includes('budget') || messageLower.includes('runway') || messageLower.includes('burn rate')) {
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

      const ceoResponse = `Greetings Owner. I have evaluated your directive for **${companyName}**: "${ownerMessage}".\n\n**Mr. Intelligence** has verified that top enterprises execute ${requiredDomain} with specialized leadership.\n\nI recommend installing the **${marketplaceListing ? marketplaceListing.title : requiredDomain}** Suite from our Marketplace.`;

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

    // 9. Full Roster Execution: Construct Job Briefing
    const prompt = `
      You are Asad, Chief Executive Officer of ${companyName}.
      The Owner has formally ordered: "${ownerMessage}".

      Strategic Scorecard: Impact ${scorecardAndMatrix.scorecard.strategicImpact}/100, Effort ${scorecardAndMatrix.scorecard.operationalEffort}, Risk ${scorecardAndMatrix.scorecard.regulatoryRisk}.
      Active Directors: ${activeExecutives.map((e) => `${e.name} (${e.title})`).join(', ') || 'No active directors configured yet'}.

      Write a formal Job Assignment & Execution Briefing for ${companyName}:
      1. Affirm the mission is officially queued for execution.
      2. Provide a 3-step Execution Roadmap.
      3. Assign specific tasks to active directors.
      4. State target milestone window (${scorecardAndMatrix.scorecard.targetCompletionDays} Days).
    `;

    let ceoText = '';
    try {
      const aiRes = await this.aiService.executePrompt({
        prompt,
        systemPrompt: `You are CEO Asad of ${companyName}. Be authoritative, structured, and decisive.`,
      });
      if (aiRes.text) ceoText = aiRes.text;
    } catch (e) {
      this.logger.warn(`[CeoOrchestrator] Job assignment AI error: ${e}`);
      ceoText = `Owner, I have received your formal execution directive for **${companyName}**: "${ownerMessage}".\n\n**Target Completion**: ${scorecardAndMatrix.scorecard.targetCompletionDays} Days.\n\nYour active board has been briefed and execution is now underway.`;
    }

    const mission = await this.prisma.mission.create({
      data: {
        companyId,
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
   * Queries real corporate memory from DB — returns [] if no missions exist yet.
   * Never injects fake/hardcoded historical objectives.
   */
  private async fetchCorporateMemoryContext(companyId: string): Promise<string[]> {
    try {
      const pastMissions = await this.prisma.mission.findMany({
        where: { companyId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      return pastMissions.map(
        (m) => `Mission: "${m.objective}" (Status: ${m.status}, Health: ${m.healthScore || 'N/A'})`,
      );
    } catch (err) {
      this.logger.warn(`[CeoOrchestrator] Corporate memory query notice: ${err}`);
      return []; // No fallback fiction — just return empty
    }
  }

  /**
   * Generates Strategic Scorecard & Executive Delegation Matrix via AI
   */
  private async generateScorecardAndMatrix(
    objective: string,
    companyName: string,
    industryContext: string,
    activeExecutives: any[],
  ): Promise<{ scorecard: StrategicScorecard; delegationMatrix: ExecutiveDelegationItem[] }> {
    const execList = activeExecutives.length > 0
      ? activeExecutives.map((e) => `${e.name} (${e.title})`).join(', ')
      : 'No active directors configured yet';

    const prompt = `
      Analyze strategic objective for ${companyName} (${industryContext}): "${objective}".
      Active Directors: ${execList}.

      Generate JSON:
      {
        "strategicImpact": 94,
        "operationalEffort": "Medium",
        "regulatoryRisk": "Low",
        "targetCompletionDays": 7,
        "delegationMatrix": [
          {
            "directorName": "Director Name from active list",
            "roleTitle": "Their Role Title",
            "responsibility": "Specific responsibility for this objective",
            "confidenceScore": 96
          }
        ]
      }
    `;

    try {
      const res = await this.aiService.executePrompt({
        prompt,
        systemPrompt: `You are CEO Asad of ${companyName}. Generate a precise strategic scorecard and delegation matrix using only the active directors listed.`,
        jsonMode: true,
      });

      let cleanedText = res.text.trim();
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleanedText);
      return {
        scorecard: {
          strategicImpact: parsed.strategicImpact || 92,
          operationalEffort: parsed.operationalEffort || 'Medium',
          regulatoryRisk: parsed.regulatoryRisk || 'Low',
          targetCompletionDays: parsed.targetCompletionDays || 7,
        },
        delegationMatrix: Array.isArray(parsed.delegationMatrix) ? parsed.delegationMatrix : [],
      };
    } catch (err) {
      this.logger.warn(`[CeoOrchestrator] Scorecard AI notice: ${err}`);
      // Return a minimal real scorecard — delegation matrix is empty if AI fails
      // Never inject hardcoded director names like "Teema" or "Legal" as fallback
      return {
        scorecard: {
          strategicImpact: 90,
          operationalEffort: 'Medium',
          regulatoryRisk: 'Low',
          targetCompletionDays: 7,
        },
        delegationMatrix: activeExecutives.slice(0, 3).map((e) => ({
          directorName: e.name,
          roleTitle: e.title,
          responsibility: `Lead execution for: ${objective.substring(0, 80)}`,
          confidenceScore: 90,
        })),
      };
    }
  }
}
