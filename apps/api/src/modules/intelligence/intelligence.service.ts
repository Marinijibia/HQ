import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { AiService } from '../ai/ai.service';

const DOMAINS = [
  'identity',
  'businessModel',
  'structure',
  'strategy',
  'operations',
  'brand',
  'customer',
  'market',
  'technology',
  'learning',
] as const;

type Domain = (typeof DOMAINS)[number];

const HEALTH_DIMENSIONS = [
  'strategy',
  'operations',
  'finance',
  'marketing',
  'sales',
  'customerSuccess',
  'technology',
  'security',
  'compliance',
  'innovation',
  'teamCollaboration',
] as const;

type HealthDimension = (typeof HEALTH_DIMENSIONS)[number];

// Maturity level thresholds (based on overall confidence %)
const MATURITY_THRESHOLDS = [
  { level: 5, label: 'Autonomous', min: 90, color: '#22C55E' },
  { level: 4, label: 'Strategic', min: 70, color: '#0A84FF' },
  { level: 3, label: 'Connected', min: 50, color: '#8B5CF6' },
  { level: 2, label: 'Aware', min: 25, color: '#F59E0B' },
  { level: 1, label: 'Basic', min: 0, color: '#EF4444' },
];

function calculateMaturityLevel(overallConfidence: number): number {
  for (const threshold of MATURITY_THRESHOLDS) {
    if (overallConfidence >= threshold.min) return threshold.level;
  }
  return 1;
}

@Injectable()
export class IntelligenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  // ─── Get or create the org intelligence record ─────────────────────────────
  async getIntelligence(companyId: string) {
    let intel = await this.prisma.orgIntelligence.findUnique({
      where: { companyId },
    });
    if (!intel) {
      intel = await this.prisma.orgIntelligence.create({
        data: { companyId },
      });
    }
    return this.enrich(intel);
  }

  // ─── Update a single domain ─────────────────────────────────────────────────
  async updateDomain(
    companyId: string,
    domain: Domain,
    data: Record<string, unknown>,
  ) {
    const dataKey = `${domain}Data`;
    const confKey = `${domain}Confidence`;

    const filledCount = Object.values(data).filter(
      (v) => v !== null && v !== undefined && v !== '',
    ).length;
    const totalCount = Math.max(Object.keys(data).length, 1);
    const confidence = Math.min(
      Math.round((filledCount / totalCount) * 100),
      100,
    );

    const updated = await this.prisma.orgIntelligence.upsert({
      where: { companyId },
      create: {
        companyId,
        [dataKey]: data as Prisma.InputJsonValue,
        [confKey]: confidence,
        lastLearnedAt: new Date(),
      },
      update: {
        [dataKey]: data as Prisma.InputJsonValue,
        [confKey]: confidence,
        lastLearnedAt: new Date(),
      },
    });

    // Recalculate overall confidence + maturity level
    const record = await this.prisma.orgIntelligence.findUnique({
      where: { companyId },
    });
    if (record) {
      const scores = DOMAINS.map(
        (d) =>
          ((record as Record<string, unknown>)[`${d}Confidence`] as number) ||
          0,
      );
      const overall = Math.round(
        scores.reduce((a, b) => a + b, 0) / DOMAINS.length,
      );
      const maturityLevel = calculateMaturityLevel(overall);
      await this.prisma.orgIntelligence.update({
        where: { companyId },
        data: { overallConfidence: overall, maturityLevel },
      });
    }

    return this.enrich(updated);
  }

  // ─── Approve a pending suggestion ───────────────────────────────────────────
  async approveSuggestion(companyId: string, suggestionId: string) {
    const intel = await this.prisma.orgIntelligence.findUnique({
      where: { companyId },
    });
    if (!intel) return null;

    const suggestions =
      (intel.pendingSuggestions as {
        id: string;
        domain: string;
        data: Record<string, unknown>;
      }[]) || [];
    const suggestion = suggestions.find((s) => s.id === suggestionId);
    if (!suggestion) return null;

    await this.updateDomain(
      companyId,
      suggestion.domain as Domain,
      suggestion.data,
    );
    const remaining = suggestions.filter((s) => s.id !== suggestionId);
    return this.prisma.orgIntelligence.update({
      where: { companyId },
      data: { pendingSuggestions: remaining as Prisma.InputJsonValue },
    });
  }

  // ─── Dismiss a pending suggestion ───────────────────────────────────────────
  async dismissSuggestion(companyId: string, suggestionId: string) {
    const intel = await this.prisma.orgIntelligence.findUnique({
      where: { companyId },
    });
    if (!intel) return null;

    const suggestions = (intel.pendingSuggestions as { id: string }[]) || [];
    const remaining = suggestions.filter((s) => s.id !== suggestionId);

    return this.prisma.orgIntelligence.update({
      where: { companyId },
      data: { pendingSuggestions: remaining },
    });
  }

  // ─── Add a learning insight ─────────────────────────────────────────────────
  async addLearningInsight(
    companyId: string,
    source: string,
    insight: string,
    domain: Domain,
  ) {
    const intel = await this.prisma.orgIntelligence.findUnique({
      where: { companyId },
    });
    const existing = (intel?.learningData as Record<string, unknown>) || {};
    const insights =
      (existing.insights as {
        id: string;
        source: string;
        insight: string;
        domain: string;
        timestamp: string;
      }[]) || [];
    insights.unshift({
      id: `${Date.now()}`,
      source,
      insight,
      domain,
      timestamp: new Date().toISOString(),
    });
    return this.prisma.orgIntelligence.upsert({
      where: { companyId },
      create: {
        companyId,
        learningData: {
          insights: insights.slice(0, 50),
        },
        lastLearnedAt: new Date(),
      },
      update: {
        learningData: {
          insights: insights.slice(0, 50),
        },
        lastLearnedAt: new Date(),
      },
    });
  }

  // ─── Get / Update Organization Health Score ──────────────────────────────────
  async getHealthScore(companyId: string) {
    const intel = await this.prisma.orgIntelligence.findUnique({
      where: { companyId },
    });
    return (
      (intel?.healthScore as Record<string, unknown>) ||
      this.defaultHealthScore()
    );
  }

  async updateHealthScore(
    companyId: string,
    dimension: HealthDimension,
    data: Record<string, unknown>,
  ) {
    const intel = await this.prisma.orgIntelligence.findUnique({
      where: { companyId },
    });
    const existing =
      (intel?.healthScore as Record<string, unknown>) ||
      this.defaultHealthScore();
    const updated = {
      ...existing,
      [dimension]: {
        ...((existing[dimension] as Record<string, unknown>) || {}),
        ...data,
      },
    };
    return this.prisma.orgIntelligence.upsert({
      where: { companyId },
      create: { companyId, healthScore: updated as Prisma.InputJsonValue },
      update: { healthScore: updated as Prisma.InputJsonValue },
    });
  }

  // ─── Evolution Timeline ───────────────────────────────────────────────────────
  async addTimelineEvent(
    companyId: string,
    event: { title: string; description?: string; type: string },
  ) {
    const intel = await this.prisma.orgIntelligence.findUnique({
      where: { companyId },
    });
    const existing =
      (intel?.evolutionTimeline as {
        id: string;
        title: string;
        description?: string;
        type: string;
        date: string;
      }[]) || [];
    existing.unshift({
      id: `${Date.now()}`,
      ...event,
      date: new Date().toISOString(),
    });
    return this.prisma.orgIntelligence.upsert({
      where: { companyId },
      create: {
        companyId,
        evolutionTimeline: existing.slice(0, 100),
      },
      update: {
        evolutionTimeline: existing.slice(0, 100),
      },
    });
  }

  async getTimeline(companyId: string) {
    const intel = await this.prisma.orgIntelligence.findUnique({
      where: { companyId },
    });
    return (
      (intel?.evolutionTimeline as {
        id: string;
        title: string;
        description?: string;
        type: string;
        date: string;
      }[]) || []
    );
  }

  // ─── Enrich with computed fields ────────────────────────────────────────────
  private enrich(intel: Record<string, unknown>) {
    const domainStatuses = DOMAINS.map((domain) => ({
      domain,
      label: this.domainLabel(domain),
      confidence: (intel[`${domain}Confidence`] as number) || 0,
      hasData:
        intel[`${domain}Data`] !== null && intel[`${domain}Data`] !== undefined,
      data: intel[`${domain}Data`] || null,
    }));

    const missing = domainStatuses
      .filter((d) => d.confidence < 50)
      .map((d) => `${d.label} profile incomplete`);

    const overallConfidence = (intel.overallConfidence as number) || 0;
    const maturityLevel = calculateMaturityLevel(overallConfidence);
    const maturityMeta =
      MATURITY_THRESHOLDS.find((t) => t.level === maturityLevel) ||
      MATURITY_THRESHOLDS[4];

    return {
      ...intel,
      domainStatuses,
      missingItems: missing,
      maturityLevel,
      maturityLabel: maturityMeta.label,
      maturityColor: maturityMeta.color,
      maturityThresholds: MATURITY_THRESHOLDS,
    };
  }

  private defaultHealthScore() {
    const result: Record<string, unknown> = {};
    for (const dim of HEALTH_DIMENSIONS) {
      result[dim] = {
        score: 0,
        trend: 'stable',
        strengths: [],
        risks: [],
        actions: [],
      };
    }
    return result;
  }

  // ─── Event-driven Learning: Listen for Completed/Delivered Missions ───
  @OnEvent('mission.delivered')
  async handleMissionDelivered(payload: {
    missionId: string;
    status: string;
    actorId?: string;
  }) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: payload.missionId },
    });
    if (!mission) return;

    // 1. Add a learning insight
    await this.addLearningInsight(
      mission.companyId,
      `Mission: ${mission.objective}`,
      `Successfully executed and delivered the campaign: "${mission.objective}".`,
      'strategy',
    );

    // 2. Add an event to the evolution timeline
    await this.addTimelineEvent(mission.companyId, {
      title: `Mission Delivered: ${mission.objective.substring(0, 50)}...`,
      description: `The campaign objective was successfully executed and approved by the corporate C-Suite board.`,
      type: 'milestone',
    });

    // 3. Dynamically increment corporate health score by 5 points for strategy or operations
    try {
      const dimensions: HealthDimension[] = [
        'strategy',
        'operations',
        'finance',
      ];
      const chosenDim =
        dimensions[Math.floor(Math.random() * dimensions.length)];
      const health = await this.getHealthScore(mission.companyId);
      const existingDim = (health[chosenDim] as Record<string, unknown>) || {};
      const currentScore = (existingDim.score as number) || 0;
      const newScore = Math.min(currentScore + 5, 100);
      await this.updateHealthScore(mission.companyId, chosenDim, {
        score: newScore,
        trend: 'up',
      });
    } catch {
      /* ignore health score error */
    }
  }

  // ─── AI Draft Generator for Domain Fields ────────────────────────────────────
  async generateDraft(
    companyId: string,
    domain: Domain,
  ): Promise<Record<string, unknown>> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    const companyName = company?.name || 'HQ Client Company';

    const systemPrompt = `You are the Chief Executive Officer's strategic analysis assistant.
Your goal is to draft realistic, professional organizational data fields for a company named "${companyName}".
Ensure your response is valid JSON matching the keys of the requested domain. Do not include any markdown styling, backticks, or extra text.`;

    const prompt = `Provide draft data for the following organizational intelligence domain: "${domain}".
Response must be a single flat JSON object containing only keys and mock values appropriate for "${companyName}".`;

    try {
      const result = await this.aiService.executePrompt({
        prompt,
        systemPrompt,
        provider: 'gemini',
        temperature: 0.7,
        companyId,
        category: 'RESEARCH',
      });

      if (result.text) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(result.text);
      }
      return {};
    } catch (e) {
      // Fallback if parsing fails
      return {};
    }
  }

  private domainLabel(domain: Domain): string {
    const labels: Record<Domain, string> = {
      identity: 'Organization Identity',
      businessModel: 'Business Model',
      structure: 'Org Structure',
      strategy: 'Strategic Direction',
      operations: 'Operations',
      brand: 'Brand Intelligence',
      customer: 'Customer Intelligence',
      market: 'Market Intelligence',
      technology: 'Technology Intelligence',
      learning: 'Organizational Learning',
    };
    return labels[domain];
  }
}
