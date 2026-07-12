import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';

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

@Injectable()
export class IntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

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
  async updateDomain(companyId: string, domain: Domain, data: Record<string, unknown>) {
    const dataKey = `${domain}Data`;
    const confKey = `${domain}Confidence`;

    // Calculate confidence from filled fields
    const filledCount = Object.values(data).filter(
      v => v !== null && v !== undefined && v !== '',
    ).length;
    const totalCount = Math.max(Object.keys(data).length, 1);
    const confidence = Math.min(Math.round((filledCount / totalCount) * 100), 100);

    const updated = await this.prisma.orgIntelligence.upsert({
      where: { companyId },
      create: {
        companyId,
        [dataKey]: data,
        [confKey]: confidence,
        lastLearnedAt: new Date(),
      },
      update: {
        [dataKey]: data,
        [confKey]: confidence,
        lastLearnedAt: new Date(),
      },
    });

    // Recalculate overall confidence
    const record = await this.prisma.orgIntelligence.findUnique({ where: { companyId } });
    if (record) {
      const scores = DOMAINS.map(d => (record as Record<string, unknown>)[`${d}Confidence`] as number || 0);
      const overall = Math.round(scores.reduce((a, b) => a + b, 0) / DOMAINS.length);
      await this.prisma.orgIntelligence.update({
        where: { companyId },
        data: { overallConfidence: overall },
      });
    }

    return this.enrich(updated);
  }

  // ─── Approve a pending suggestion ───────────────────────────────────────────
  async approveSuggestion(companyId: string, suggestionId: string) {
    const intel = await this.prisma.orgIntelligence.findUnique({ where: { companyId } });
    if (!intel) return null;

    const suggestions = (intel.pendingSuggestions as { id: string; domain: string; data: Record<string, unknown> }[]) || [];
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return null;

    // Apply the suggestion data to the domain
    await this.updateDomain(companyId, suggestion.domain as Domain, suggestion.data);

    // Remove from pending
    const remaining = suggestions.filter(s => s.id !== suggestionId);
    return this.prisma.orgIntelligence.update({
      where: { companyId },
      data: { pendingSuggestions: remaining as Prisma.InputJsonValue },
    });
  }

  // ─── Dismiss a pending suggestion ───────────────────────────────────────────
  async dismissSuggestion(companyId: string, suggestionId: string) {
    const intel = await this.prisma.orgIntelligence.findUnique({ where: { companyId } });
    if (!intel) return null;

    const suggestions = (intel.pendingSuggestions as { id: string }[]) || [];
    const remaining = suggestions.filter(s => s.id !== suggestionId);

    return this.prisma.orgIntelligence.update({
      where: { companyId },
      data: { pendingSuggestions: remaining as Prisma.InputJsonValue },
    });
  }

  // ─── Add a learning insight ─────────────────────────────────────────────────
  async addLearningInsight(companyId: string, source: string, insight: string, domain: Domain) {
    const intel = await this.prisma.orgIntelligence.findUnique({ where: { companyId } });
    const existing = (intel?.learningData as Record<string, unknown>) || {};
    const insights = (existing.insights as { id: string; source: string; insight: string; domain: string; timestamp: string }[]) || [];
    insights.unshift({
      id: `${Date.now()}`,
      source,
      insight,
      domain,
      timestamp: new Date().toISOString(),
    });
    return this.prisma.orgIntelligence.upsert({
      where: { companyId },
      create: { companyId, learningData: { insights: insights.slice(0, 50) }, lastLearnedAt: new Date() },
      update: { learningData: { insights: insights.slice(0, 50) }, lastLearnedAt: new Date() },
    });
  }

  // ─── Enrich with computed fields ────────────────────────────────────────────
  private enrich(intel: Record<string, unknown>) {
    const domainStatuses = DOMAINS.map(domain => ({
      domain,
      label: this.domainLabel(domain),
      confidence: (intel[`${domain}Confidence`] as number) || 0,
      hasData: intel[`${domain}Data`] !== null,
      data: intel[`${domain}Data`] || null,
    }));

    const missing = domainStatuses
      .filter(d => d.confidence < 50)
      .map(d => `${d.label} profile incomplete`);

    return {
      ...intel,
      domainStatuses,
      missingItems: missing,
    };
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
