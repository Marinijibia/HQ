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

/** Centralized plan code constants — update here only if plans change */
export const PLAN_CODES = {
  FREE: 'free',
  GROWTH: 'growth',
  PRO: 'pro',
  TEAM: 'team',
  ENTERPRISE: 'enterprise',
} as const;

/** Active mission limits per plan — single source of truth */
const MISSION_LIMITS: Record<string, number> = {
  [PLAN_CODES.FREE]: 1, // Freemium: 1 active mission at a time
  [PLAN_CODES.GROWTH]: 10, // Growth/Pro: 10 concurrent missions
  [PLAN_CODES.PRO]: 10,
  [PLAN_CODES.TEAM]: 10,
  [PLAN_CODES.ENTERPRISE]: Infinity, // Enterprise: unlimited
};

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

    // 1. Retrieve the company's active subscription
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });

    // Freemium safety net: if subscription row is missing (e.g. DB inconsistency after
    // a failed onboarding transaction), apply Free tier limits and log a warning.
    // This prevents a DB hiccup from hard-locking a legitimate user out of the product.
    // In normal flow, onboardCompany() always provisions a subscription.
    let planCode = PLAN_CODES.FREE;
    if (!subscription || !subscription.plan) {
      this.logger.warn(
        `[EntitlementGuard] No subscription found for company ${companyId}. Applying Free tier limits as safety net.`,
      );
    } else {
      planCode = (subscription.plan.code?.toLowerCase() ??
        PLAN_CODES.FREE) as typeof PLAN_CODES.FREE;
    }

    // 2. Resolve the active mission limit for this plan
    const maxActiveMissions = MISSION_LIMITS[planCode] ?? 1;

    // 3. Count missions currently EXECUTING for this org only (org-scoped — no cross-tenant leakage)
    const activeMissionsCount = await this.prisma.mission.count({
      where: {
        companyId,
        status: MissionStatus.EXECUTING,
        deletedAt: null,
      },
    });

    this.logger.log(
      `[Entitlement] Org ${companyId} | Plan: "${planCode.toUpperCase()}" | Active missions: ${activeMissionsCount}/${maxActiveMissions === Infinity ? '∞' : maxActiveMissions}`,
    );

    // 4. Enforce the limit — return an upgrade-friendly message for the web to intercept
    if (activeMissionsCount >= maxActiveMissions) {
      const limitDisplay =
        maxActiveMissions === Infinity ? 'unlimited' : maxActiveMissions;
      throw new ForbiddenException(
        JSON.stringify({
          code: 'ENTITLEMENT_LIMIT_REACHED',
          planCode: planCode.toUpperCase(),
          activeMissions: activeMissionsCount,
          maxActiveMissions: limitDisplay,
          message: `Your ${planCode.toUpperCase()} plan allows ${limitDisplay} active mission${maxActiveMissions === 1 ? '' : 's'} at a time. Upgrade to run more simultaneously.`,
          upgradeUrl: '/billing',
        }),
      );
    }

    return true;
  }
}
