import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AiService } from '../ai/ai.service';

export interface ScopeMissionResult {
  ceoResponse: string;
  isMissingDepartment: boolean;
  missingDepartmentName?: string;
  recommendedMarketplaceListing?: any;
  missionPlan?: any;
  assignedExecutives?: string[];
  mode: 'CONVERSATION' | 'JOB_ASSIGNMENT';
}

@Injectable()
export class CeoOrchestratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async scopeMission(
    companyId: string,
    ownerMessage: string,
    requestedMode?: 'CONVERSATION' | 'JOB_ASSIGNMENT',
  ): Promise<ScopeMissionResult> {
    // 1. Fetch Company details & OrgIntelligence (with fallback to first active company)
    let company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { orgIntelligence: true },
    });

    if (!company) {
      company = await this.prisma.company.findFirst({
        include: { orgIntelligence: true },
      });
    }

    const companyName = company?.name || 'FuelOS';
    const intel = company?.orgIntelligence;

    // 2. Fetch active executives in workspace
    const activeExecutives = await this.prisma.executive.findMany({
      where: { isActiveInWorkspace: true },
      include: { department: true },
    });

    const activeDepartmentNames = activeExecutives
      .map((e) => e.department?.name.toLowerCase())
      .filter(Boolean);

    const messageLower = ownerMessage.toLowerCase();

    // 3. Determine Mode: Conversation vs. Job Assignment
    let isExecutionDirective = false;

    if (requestedMode === 'JOB_ASSIGNMENT') {
      isExecutionDirective = true;
    } else if (requestedMode === 'CONVERSATION') {
      isExecutionDirective = false;
    } else {
      // Auto-classify based on action keywords
      const actionKeywords = [
        'build', 'create', 'launch', 'execute', 'develop', 'run',
        'perform', 'audit', 'deploy', 'start', 'assign', 'implement',
      ];
      isExecutionDirective = actionKeywords.some((kw) => messageLower.includes(kw));
    }

    // 4. CONVERSATION MODE: Real AI dynamic strategic dialogue
    if (!isExecutionDirective) {
      const prompt = `
        You are Asad, Chief Executive Officer of ${companyName}.
        Company Intelligence Context for ${companyName}:
        - Identity: ${intel?.identityData ? JSON.stringify(intel.identityData) : 'FuelOS Petroleum & Energy Supply Chain Logistics, Downstream Dispensing Automation'}
        - Business Model: ${intel?.businessModelData ? JSON.stringify(intel.businessModelData) : 'Petroleum SaaS subscriptions & smart terminal telemetry'}
        - Brand Voice: ${intel?.brandData ? JSON.stringify(intel.brandData) : 'Professional, authoritative, high-efficiency, futuristic'}

        Active Core Roster in Headquarters:
        ${activeExecutives.map((e) => `- ${e.name} (${e.title}) in ${e.department?.name}`).join('\n')}

        The Owner of ${companyName} says to you: "${ownerMessage}".

        Instructions:
        1. Answer directly and intelligently as CEO Asad.
        2. If the owner asks what you know about ${companyName} or their business, share specific details about ${companyName}'s petroleum logistics, software telemetry, and energy products gathered by Mr. Intelligence.
        3. Do NOT repeat a generic hardcoded intro. Be adaptive, context-aware, and executive-level.
        4. Ask 1 sharp follow-up strategic question to deepen executive alignment.
      `;

      let conversationalText = '';

      try {
        const aiRes = await this.aiService.executePrompt({
          prompt,
          systemPrompt: `You are CEO Asad, Chief Executive Officer of ${companyName}. You possess deep knowledge about ${companyName} gathered from headquarters intelligence. Be sharp, dynamic, and adaptive.`,
          provider: 'gemini',
        });
        if (aiRes.text) {
          conversationalText = aiRes.text;
        }
      } catch (e) {
        // Fallback dynamic response
        conversationalText = `Greetings Owner! As CEO of **${companyName}**, I am fully integrated with our headquarters intelligence layer.

Regarding your question about **${companyName}**: Our team (**Mr. Intelligence**, **Teema**, **Legal**, **Resource Director**, and myself) has indexed our core domain in petroleum supply chain logistics, smart station telemetry, and downstream energy automation.

What strategic direction or expansion plan shall we analyze next for ${companyName}?`;
      }

      return {
        ceoResponse: conversationalText,
        isMissingDepartment: false,
        mode: 'CONVERSATION',
      };
    }

    // 5. JOB ASSIGNMENT MODE: CEO evaluates required departments & assigns job
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

    // 6. If missing department, recommend marketplace installation
    if (requiredDomain && missingDeptKey) {
      const marketplaceListing = await this.prisma.marketplaceListing.findFirst({
        where: {
          OR: [
            { departmentKey: missingDeptKey },
            { category: { contains: missingDeptKey.split('_')[0], mode: 'insensitive' } },
          ],
        },
      });

      const ceoResponse = `Greetings Owner. I have evaluated your execution order for **${companyName}**: "${ownerMessage}". 

To deliver this at enterprise standards, we require the specialized capabilities of the **${requiredDomain} Department**. 

Currently, our active workspace roster includes our 5 baseline core directors:
- **Asad** (Chief Executive Officer)
- **Teema** (Operations Director)
- **Legal** (Legal & Compliance Director)
- **Resource Director** (Human Resources Director)
- **Mr. Intelligence** (Public Web Research Agent)

I strongly recommend installing the **${marketplaceListing ? marketplaceListing.title : requiredDomain}** from our Marketplace so we can deploy dedicated AI directors for this task.`;

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
      };
    }

    // 7. Otherwise, active roster covers the mission! Construct AI job assignment plan
    const prompt = `
      You are Asad, Chief Executive Officer of ${companyName}.
      Company Intelligence Context: ${intel?.identityData ? JSON.stringify(intel.identityData) : 'Enterprise Operations'}.

      The Owner has formally ordered the execution of: "${ownerMessage}".

      Active Directors available:
      ${activeExecutives.map((e) => `- ${e.name} (${e.title}) in ${e.department?.name}`).join('\n')}

      Write a formal Job Assignment & Execution Briefing for ${companyName}:
      1. Affirm that the mission is officially queued for execution.
      2. Provide a 3-step Execution Roadmap.
      3. Assign specific tasks to active directors (e.g. Teema for Operations, Legal for Compliance).
      4. State target milestone completion window.
    `;

    let ceoText = '';

    try {
      const aiRes = await this.aiService.executePrompt({
        prompt,
        systemPrompt: `You are CEO Asad of ${companyName}. Be authoritative, structured, and decisive.`,
        provider: 'gemini',
      });
      if (aiRes.text) {
        ceoText = aiRes.text;
      }
    } catch (e) {
      ceoText = `Owner, I have received your formal execution directive for **${companyName}**: "${ownerMessage}".

I have officially queued this mission and assigned active department directors:

### 📋 Job Assignment & Execution Plan
1. **Feasibility & Operational Analysis**: Teema will structure task dependencies and work schedules.
2. **Governance & Legal Guardrails**: Legal will review compliance constraints and data handling policies.
3. **Milestone Orchestration & Task Graph**: Asad will monitor progress and report milestone updates.

**Assigned Active Directors**: Teema (Operations), Legal (Compliance), Asad (CEO).

The mission task graph is officially live in HQ.`;
    }

    // Create mission record in database
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
    };
  }
}
