import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../database/prisma.service';
import { MissionStatus } from '@prisma/client';

@Injectable()
export class EntitlementGuard implements CanActivate {
  private readonly logger = new Logger(EntitlementGuard.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.companyId) {
      throw new ForbiddenException('Access denied: Missing tenant details');
    }

    const companyId = user.companyId;

    // 1. Retrieve the company's active subscription plan code
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });

    const planCode = subscription?.plan?.code?.toLowerCase() || 'free';

    // Map plan codes to maximum allowed active running missions
    // Free Tier: 1 active mission
    // Team/Growth Tier: 10 active missions
    // Enterprise Tier: Unlimited (represented by Infinity)
    let maxActiveMissions = 1;
    if (planCode === 'growth' || planCode === 'team') {
      maxActiveMissions = 10;
    } else if (planCode === 'enterprise') {
      maxActiveMissions = Infinity;
    }

    // 2. Count the active running missions (status = EXECUTING)
    const activeMissionsCount = await this.prisma.mission.count({
      where: {
        companyId,
        status: MissionStatus.EXECUTING,
        deletedAt: null,
      },
    });

    this.logger.log(
      `Company ${companyId} running plan "${planCode}" has ${activeMissionsCount}/${maxActiveMissions} active missions.`,
    );

    if (activeMissionsCount >= maxActiveMissions) {
      throw new ForbiddenException(
        `Subscription limit reached: Your current plan "${planCode.toUpperCase()}" permits a maximum of ${maxActiveMissions} active missions. Upgrade to run more.`,
      );
    }

    return true;
  }
}
