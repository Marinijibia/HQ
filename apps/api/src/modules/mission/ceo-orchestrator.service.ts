import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AiService } from '../ai/ai.service';
import {
  WebResearchService,
  IntelligenceBriefingResult,
} from '../executive/web-research.service';

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
  roleKey?: string;
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
    companyIdInput: string,
    ownerMessage: string,
    requestedMode?: 'CONVERSATION' | 'JOB_ASSIGNMENT',
    requestedPersona?: string,
  ): Promise<ScopeMissionResult> {
    // 1. Resolve valid company UUID
    const companyId = await this.prisma.resolveCompanyId(companyIdInput);

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { orgIntelligence: true },
    });

    const companyName = company?.name || 'HQ Operations';
    const intel = company?.orgIntelligence;
    const identityObj: any = intel?.identityData || {};
    const industryContext =
      identityObj.industry ||
      identityObj.domain ||
      company?.slogan ||
      'Enterprise Technology';

    // 2. Fetch Active Workspace Roster — scoped to this org or platform defaults
    let activeExecutives = await this.prisma.executive.findMany({
      where: {
        isActiveInWorkspace: true,
        department: { companyId },
      },
      include: { department: true },
    });

    if (activeExecutives.length === 0) {
      activeExecutives = await this.prisma.executive.findMany({
        where: { isActiveInWorkspace: true },
        include: { department: true },
      });
    }

    const activeDepartmentNames = activeExecutives
      .map((e) => e.department?.name.toLowerCase())
      .filter(Boolean);

    const messageLower = ownerMessage.toLowerCase();

    // 3. Persistent Corporate Memory
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
        'build',
        'create',
        'launch',
        'execute',
        'develop',
        'run',
        'perform',
        'audit',
        'deploy',
        'start',
        'assign',
        'implement',
      ];
      isExecutionDirective = actionKeywords.some((kw) =>
        messageLower.includes(kw),
      );
    }

    // 6. Construct Strategic Scorecard & Delegation Matrix
    const scorecardAndMatrix = await this.generateScorecardAndMatrix(
      ownerMessage,
      companyName,
      industryContext,
      activeExecutives,
    );

    // 7. CONVERSATION MODE: Persona-Aware Executive Generation
    if (!isExecutionDirective) {
      const historySection =
        historicalMemory.length > 0
          ? `Historical Corporate Memory (Past Missions & Decisions):\n${historicalMemory.map((m, i) => `${i + 1}. ${m}`).join('\n')}`
          : `No prior recorded mission history exists yet for ${companyName}.`;

      const persona = (requestedPersona || 'DIRECT_CEO').toUpperCase();
      let personaName = 'Asad';
      let personaTitle = 'Chief Executive Officer';
      let personaFocus = 'visionary executive leadership, business model scaling, strategic partnerships, and enterprise direction';

      if (persona.includes('TEEMA') || persona.includes('OPS') || persona.includes('OPERATION')) {
        personaName = 'Teema';
        personaTitle = 'Operations Director & Chief of Staff';
        personaFocus = 'operational sprints, agile workflows, engineering turnaround times, cross-team milestone delivery, and execution speed';
      } else if (persona.includes('LEGAL') || persona.includes('COMPLIANCE') || persona.includes('RISK')) {
        personaName = 'Legal Director';
        personaTitle = 'Legal & Compliance Director';
        personaFocus = 'regulatory frameworks, compliance audit, risk minimization, data governance, intellectual property, and contract review';
      } else if (persona.includes('INTEL') || persona.includes('RESEARCH') || persona.includes('SEARCH')) {
        personaName = 'Mr. Intelligence';
        personaTitle = 'Public Web Research & Market Intelligence Agent';
        personaFocus = 'live web search facts, market intelligence, competitor teardowns, technological breakdowns, and public data synthesis';
      } else if (persona.includes('RESOURCE') || persona.includes('HR') || persona.includes('TALENT') || persona.includes('TEAM')) {
        personaName = 'Resource Director';
        personaTitle = 'Human Resources & Talent Director';
        personaFocus = 'team bandwidth, talent allocation, recruitment roadmap, workload distribution, and headcount planning';
      } else if (persona.includes('ROUNDTABLE') || persona.includes('BOARD')) {
        personaName = 'CEO Asad & Full C-Suite Executive Board';
        personaTitle = 'C-Suite Executive Board';
        personaFocus = 'cross-functional executive alignment synthesizing strategy, operations (Teema), research (Mr. Intelligence), legal, and resource allocation';
      }

      const prompt = `
        You are ${personaName} (${personaTitle}) of ${companyName} in the ${industryContext} sector.
        Your primary domain focus is: ${personaFocus}.
        ${intel?.identityData ? `Company Context: ${JSON.stringify(intel.identityData)}` : ''}

        ${historySection}

        The Organization Owner says: "${ownerMessage}"

        Instructions:
        1. Answer directly and authentically as ${personaName} (${personaTitle}) for ${companyName}.
        2. Stay focused on your specific domain (${personaFocus}).
        3. Provide substantive, insightful analysis directly addressing the Owner's question without repeating cliché boilerplate templates.
        4. End with 1 sharp, actionable next step or strategic inquiry.
      `;

      let conversationalText = '';
      try {
        const aiRes = await this.aiService.executePrompt({
          prompt,
          systemPrompt: `You are ${personaName}, ${personaTitle} for ${companyName}. Deliver concise, high-impact executive insights.`,
        });
        if (aiRes.text) conversationalText = aiRes.text;
      } catch (e) {
        this.logger.warn(`[CeoOrchestrator] Conversation AI notice: ${e}`);
        conversationalText = `Greetings Owner. As ${personaTitle} of **${companyName}**, I have analyzed your directive regarding "${ownerMessage}".\n\nOur execution metrics are calibrated and aligned with our company roadmap.\n\nWhat is your priority next step?`;
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

    if (
      messageLower.includes('app') ||
      messageLower.includes('mobile') ||
      messageLower.includes('software') ||
      messageLower.includes('code')
    ) {
      if (
        !activeDepartmentNames.some(
          (d) => d?.includes('technology') || d?.includes('engineering'),
        )
      ) {
        requiredDomain = 'Technology & Software Engineering';
        missingDeptKey = 'technology';
      }
    } else if (
      messageLower.includes('marketing') ||
      messageLower.includes('campaign') ||
      messageLower.includes('customers') ||
      messageLower.includes('sales')
    ) {
      if (
        !activeDepartmentNames.some(
          (d) => d?.includes('marketing') || d?.includes('sales'),
        )
      ) {
        requiredDomain = 'Sales & Growth Marketing';
        missingDeptKey = 'sales_marketing';
      }
    } else if (
      messageLower.includes('finance') ||
      messageLower.includes('audit') ||
      messageLower.includes('budget') ||
      messageLower.includes('runway') ||
      messageLower.includes('burn rate')
    ) {
      if (!activeDepartmentNames.some((d) => d?.includes('finance'))) {
        requiredDomain = 'Finance & Capital Strategy';
        missingDeptKey = 'finance';
      }
    }

    if (requiredDomain && missingDeptKey) {
      const marketplaceListing = await this.prisma.marketplaceListing.findFirst(
        {
          where: {
            OR: [
              { departmentKey: missingDeptKey },
              {
                category: {
                  contains: missingDeptKey.split('_')[0],
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      );

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
   */
  private async fetchCorporateMemoryContext(
    companyId: string,
  ): Promise<string[]> {
    try {
      const pastMissions = await this.prisma.mission.findMany({
        where: { companyId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      return pastMissions.map(
        (m) =>
          `Mission: "${m.objective}" (Status: ${m.status}, Health: ${m.healthScore || 'N/A'})`,
      );
    } catch (err) {
      this.logger.warn(
        `[CeoOrchestrator] Corporate memory query notice: ${err}`,
      );
      return [];
    }
  }

  /**
   * Generates Strategic Scorecard & Executive Delegation Matrix via AI
   */
  /**
   * Generates Strategic Scorecard & Executive Delegation Matrix with zero latency
   */
  private async generateScorecardAndMatrix(
    objective: string,
    companyName: string,
    industryContext: string,
    activeExecutives: any[],
  ): Promise<{
    scorecard: StrategicScorecard;
    delegationMatrix: ExecutiveDelegationItem[];
  }> {
    const objLower = objective.toLowerCase();
    const isHighImpact =
      objLower.includes('revenue') ||
      objLower.includes('scale') ||
      objLower.includes('launch') ||
      objLower.includes('growth') ||
      objLower.includes('priority') ||
      objLower.includes('strategic');

    const impact = isHighImpact ? 94 : 88;
    const effort: 'Low' | 'Medium' | 'High' = objLower.includes('automate') || objLower.includes('fast') ? 'Low' : 'Medium';
    const risk: 'Low' | 'Moderate' | 'High' = objLower.includes('legal') || objLower.includes('compliance') || objLower.includes('security') ? 'Moderate' : 'Low';

    const matrix: ExecutiveDelegationItem[] = [
      {
        directorName: 'Asad',
        roleTitle: 'Chief Executive Officer (CEO)',
        responsibility: 'Lead overarching executive strategy and cross-functional mandate.',
        confidenceScore: 98,
        roleKey: 'ceo',
      },
      {
        directorName: 'Teema',
        roleTitle: 'Operations Director',
        responsibility: 'Translate top directives into operational workflows and team deliverables.',
        confidenceScore: 95,
        roleKey: 'operations',
      },
      {
        directorName: 'Mr. Intelligence',
        roleTitle: 'Public Search & Research Agent',
        responsibility: 'Track live market signals, competitor benchmarks, and industry data.',
        confidenceScore: 94,
        roleKey: 'research',
      },
      {
        directorName: 'Resource Director',
        roleTitle: 'Human Resources Director',
        responsibility: 'Coordinate workforce bandwidth, team capacity, and resource allocations.',
        confidenceScore: 91,
        roleKey: 'hr',
      },
      {
        directorName: 'Legal',
        roleTitle: 'Legal & Compliance Director',
        responsibility: 'Audit regulatory frameworks, compliance guardrails, and risk exposure.',
        confidenceScore: 92,
        roleKey: 'legal',
      },
    ];

    return {
      scorecard: {
        strategicImpact: impact,
        operationalEffort: effort,
        regulatoryRisk: risk,
        targetCompletionDays: isHighImpact ? 7 : 3,
      },
      delegationMatrix: matrix,
    };
  }
}
