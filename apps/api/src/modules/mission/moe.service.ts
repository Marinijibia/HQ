import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../database/prisma.service';
import { MissionStatus } from '@prisma/client';

export type HealthScore =
  'EXCELLENT' | 'HEALTHY' | 'ATTENTION_REQUIRED' | 'CRITICAL';
export type OversightPolicy =
  'INFORM' | 'RECOMMEND' | 'REQUIRE_APPROVAL' | 'AUTOMATIC';

export interface MissionHealthDetails {
  score: HealthScore;
  warningsCount: number;
  revisionCount: number;
  averageConfidence: number;
}

@Injectable()
export class MoeService {
  private readonly logger = new Logger(MoeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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

      // Enforce soft delete/legal hold blocks during transitions
      if (mission.isLegalHold && newStatus === MissionStatus.ARCHIVED) {
        throw new Error(
          'Action Blocked: Mission is currently under Legal Hold.',
        );
      }

      // Update state
      await tx.mission.update({
        where: { id: missionId },
        data: {
          status: newStatus,
          updatedBy: actorId,
        },
      });

      // Register audit log event
      const isUuid = (val?: string) =>
        val &&
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          val,
        );
      await tx.auditLog.create({
        data: {
          companyId: mission.companyId,
          actorId: isUuid(actorId) ? actorId : undefined,
          eventType: `mission.status.${newStatus.toLowerCase()}`,
          metadata: {
            missionId,
            previousStatus: mission.status,
            newStatus,
          },
        },
      });
    });

    // Emit decoupled event-driven hooks
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

    // Default calculations for mock setups
    let warningsCount = 0;
    let revisionCount = 0;
    let averageConfidence = 95;

    // Iterate tasks to aggregate values
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

    // Heuristics mapping HealthScore grades
    let score: HealthScore = 'EXCELLENT';
    if (warningsCount > 2 || revisionCount > 3) {
      score = 'CRITICAL';
    } else if (warningsCount > 0 || revisionCount > 1) {
      score = 'ATTENTION_REQUIRED';
    } else if (averageConfidence < 85) {
      score = 'HEALTHY';
    }

    this.logger.log(
      `[MOE Health Monitor] Mission ${missionId} calculated health grade: ${score}. Warnings: ${warningsCount}`,
    );

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
      this.logger.warn(
        `[MOE Oversight Engine] Mission ${missionId} paused. Awaiting user confirmation.`,
      );
      await this.transitionState(missionId, MissionStatus.PLANNING);
      return 'PAUSED_AWAITING_APPROVAL';
    }

    // Execute automatically
    await action();

    if (policy === 'INFORM') {
      this.logger.log(
        `[MOE Oversight Engine] Informing managers of execution event...`,
      );
      // Emit internal event notice
      this.eventEmitter.emit('notification.created', {
        title: 'Mission Task Executed',
        message: `Task executed autonomously under dynamic INFORM policy bounds.`,
      });
    }

    return 'EXECUTED_SUCCESSFULLY';
  }
}
