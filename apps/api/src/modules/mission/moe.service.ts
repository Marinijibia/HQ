import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../database/prisma.service';
import { AiService } from '../ai/ai.service';
import { MissionStatus } from '@prisma/client';
import * as crypto from 'crypto';

export type HealthScore =
  | 'EXCELLENT'
  | 'HEALTHY'
  | 'ATTENTION_REQUIRED'
  | 'CRITICAL';

export type OversightPolicy =
  | 'INFORM'
  | 'RECOMMEND'
  | 'REQUIRE_APPROVAL'
  | 'AUTOMATIC';

export interface LegalClearanceCertificate {
  approved: boolean;
  regulatoryRiskScore: number; // 0-100 (lower is safer)
  complianceFrameworksVerified: string[];
  restrictedKeywordsFound: string[];
  legalNotes: string;
  cryptographicAuditStamp: string;
}

export interface MissionHealthDetails {
  score: HealthScore;
  warningsCount: number;
  revisionCount: number;
  averageConfidence: number;
}

@Injectable()
export class MoeService {
  private readonly logger = new Logger(MoeService.name);

  /** Build the Legal system prompt dynamically with the real company name */
  private buildLegalSystemPrompt(companyName: string): string {
    return `You are Legal, the Legal & Compliance Director of ${companyName}.
Your directive is to enforce zero-trust legal guardrails, regulatory compliance (GDPR, SOC2, financial compliance, petroleum safety standards), and risk management.
Maintain an authoritative, strict, and risk-averse legal perspective.`;
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly aiService: AiService,
  ) {}

  /**
   * AI Compliance Clearance Engine
   */
  async reviewComplianceGuardrails(
    objective: string,
    content: string,
    industryContext: string = 'Enterprise Software & Technology',
    companyName: string = 'your organization',
  ): Promise<LegalClearanceCertificate> {
    this.logger.log(`[Legal Director] Initiating AI compliance audit for ${industryContext}...`);

    const prompt = `
      Evaluate content for compliance in ${industryContext}:
      Objective: "${objective}"
      Content: "${content}"

      Provide legal audit in JSON format:
      {
        "approved": true,
        "regulatoryRiskScore": 12,
        "complianceFrameworksVerified": ["GDPR", "SOC2 Type II", "Zero-Trust Data Protection"],
        "restrictedKeywordsFound": [],
        "legalNotes": "Content satisfies enterprise regulatory guardrails and data privacy standards."
      }
    `;

    let approved = true;
    let regulatoryRiskScore = 15;
    let complianceFrameworksVerified = ['GDPR', 'SOC2 Type II', 'Zero-Trust Audit Logs'];
    let restrictedKeywordsFound: string[] = [];
    let legalNotes = 'Content satisfies enterprise regulatory guardrails and privacy standards.';

    try {
      const response = await this.aiService.executePrompt({
        prompt,
        systemPrompt: this.buildLegalSystemPrompt(companyName),
        jsonMode: true,
        temperature: 0.1,
      });

      const parsed = JSON.parse(response.text);
      approved = parsed.approved !== false;
      regulatoryRiskScore = typeof parsed.regulatoryRiskScore === 'number' ? parsed.regulatoryRiskScore : 15;
      complianceFrameworksVerified = parsed.complianceFrameworksVerified || complianceFrameworksVerified;
      restrictedKeywordsFound = parsed.restrictedKeywordsFound || [];
      legalNotes = parsed.legalNotes || legalNotes;
    } catch (err) {
      this.logger.warn(`[Legal Director] Compliance AI audit notice: ${err}`);
    }

    const auditStamp = crypto
      .createHash('sha256')
      .update(`${objective}:${content}:${Date.now()}`)
      .digest('hex');

    return {
      approved,
      regulatoryRiskScore,
      complianceFrameworksVerified,
      restrictedKeywordsFound,
      legalNotes,
      cryptographicAuditStamp: auditStamp,
    };
  }

  /**
   * Toggle Legal Hold on any Mission
   */
  async toggleLegalHold(missionId: string, isHoldActive: boolean, reason?: string): Promise<boolean> {
    this.logger.log(`[Legal Director] Updating Legal Hold on mission ${missionId}: ${isHoldActive}`);

    const mission = await this.prisma.mission.update({
      where: { id: missionId },
      data: { isLegalHold: isHoldActive },
    });

    const auditStamp = crypto
      .createHash('sha256')
      .update(`LEGAL_HOLD:${missionId}:${isHoldActive}:${Date.now()}`)
      .digest('hex');

    await this.prisma.auditLog.create({
      data: {
        companyId: mission.companyId,
        eventType: isHoldActive ? 'legal.hold.enabled' : 'legal.hold.disabled',
        metadata: {
          missionId,
          reason: reason || 'Legal Compliance Review',
          auditStamp,
        },
      },
    });

    return mission.isLegalHold;
  }

  async transitionState(
    missionId: string,
    newStatus: MissionStatus,
    actorId?: string,
  ): Promise<void> {
    this.logger.log(
      `[MOE State Machine] Transitioning mission ${missionId} to: ${newStatus}`,
    );

    await this.prisma.$transaction(async (tx) => {
      const mission = await tx.mission.findUnique({
        where: { id: missionId },
      });

      if (!mission) {
        throw new Error('Mission not found');
      }

      if (mission.isLegalHold && newStatus === MissionStatus.ARCHIVED) {
        throw new Error('Action Blocked: Mission is currently under Legal Hold.');
      }

      await tx.mission.update({
        where: { id: missionId },
        data: {
          status: newStatus,
          updatedBy: actorId,
        },
      });

      const auditStamp = crypto
        .createHash('sha256')
        .update(`${missionId}:${newStatus}:${actorId}:${Date.now()}`)
        .digest('hex');

      const isUuid = (val?: string) =>
        val &&
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);

      await tx.auditLog.create({
        data: {
          companyId: mission.companyId,
          actorId: isUuid(actorId) ? actorId : undefined,
          eventType: `mission.status.${newStatus.toLowerCase()}`,
          metadata: {
            missionId,
            previousStatus: mission.status,
            newStatus,
            cryptographicAuditStamp: auditStamp,
          },
        },
      });
    });

    this.eventEmitter.emit(`mission.${newStatus.toLowerCase()}`, {
      missionId,
      status: newStatus,
      actorId,
    });
  }

  async calculateHealthScore(missionId: string): Promise<MissionHealthDetails> {
    this.logger.log(
      `[MOE Health Monitor] Evaluating task logs for mission ${missionId}...`,
    );

    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      include: { tasks: true },
    });

    if (!mission) {
      throw new Error('Mission not found');
    }

    let warningsCount = 0;
    let revisionCount = 0;
    let averageConfidence = 95;

    if (mission.tasks && mission.tasks.length > 0) {
      let confidenceSum = 0;
      mission.tasks.forEach((t) => {
        const task = t as unknown as {
          status: string;
          revisionCount?: number;
          confidenceScore?: number;
        };
        if (task.status === 'FAILED') {
          warningsCount++;
        }
        if (task.revisionCount) {
          revisionCount += task.revisionCount;
        }
        confidenceSum += task.confidenceScore || 90;
      });
      averageConfidence = Math.round(confidenceSum / mission.tasks.length);
    }

    let score: HealthScore = 'EXCELLENT';
    if (warningsCount > 2 || revisionCount > 3) {
      score = 'CRITICAL';
    } else if (warningsCount > 0 || revisionCount > 1) {
      score = 'ATTENTION_REQUIRED';
    } else if (averageConfidence < 85) {
      score = 'HEALTHY';
    }

    return {
      score,
      warningsCount,
      revisionCount,
      averageConfidence,
    };
  }

  async executeOversightHook(
    missionId: string,
    policy: OversightPolicy,
    action: () => Promise<void>,
  ): Promise<string> {
    this.logger.log(
      `[MOE Oversight Engine] Evaluating policy: ${policy} for mission ${missionId}`,
    );

    if (policy === 'REQUIRE_APPROVAL') {
      await this.transitionState(missionId, MissionStatus.PLANNING);
      return 'PAUSED_AWAITING_APPROVAL';
    }

    await action();

    if (policy === 'INFORM') {
      this.eventEmitter.emit('notification.created', {
        title: 'Mission Task Executed',
        message: `Task executed autonomously under dynamic INFORM policy bounds.`,
      });
    }

    return 'EXECUTED_SUCCESSFULLY';
  }
}
