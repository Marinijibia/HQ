import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
  Optional,
  Inject,
} from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../database/prisma.service';
import { UserRepository } from '../user/user.repository';
import { AuthService } from '../auth/auth.service';
import { OnboardCompanyDto } from './dto/onboard-company.dto';

/** Free tier hard limits — single source of truth */
export const FREE_TIER_LIMITS = {
  ACTIVE_MISSIONS: 1,
  MONTHLY_CREDITS: 500,
  WALLET_STARTER_USD: 0,
} as const;

export const GROWTH_TIER_LIMITS = {
  ACTIVE_MISSIONS: 10,
  MONTHLY_CREDITS: 25000,
  WALLET_STARTER_USD: 0,
} as const;

export const ENTERPRISE_TIER_LIMITS = {
  ACTIVE_MISSIONS: 100,
  MONTHLY_CREDITS: 200000,
  WALLET_STARTER_USD: 0,
} as const;

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    @Optional()
    @Inject('REDIS_CLIENT')
    private readonly redisClient?: Redis,
  ) {}

  async checkSlugAvailability(
    slug: string,
    clientIp?: string,
  ): Promise<{ available: boolean; slug: string }> {
    if (clientIp && this.redisClient && this.redisClient.status === 'ready') {
      try {
        const rateKey = `rate:slug_check:${clientIp}`;
        const count = await this.redisClient.incr(rateKey);
        if (count === 1) await this.redisClient.expire(rateKey, 60);
        if (count > 20) {
          throw new BadRequestException(
            'Too many slug verification requests. Please wait a moment.',
          );
        }
      } catch (err) {
        if (err instanceof BadRequestException) throw err;
      }
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-');
    try {
      const existing = await this.prisma.company.findUnique({
        where: { slug: cleanSlug },
      });
      return {
        available: !existing,
        slug: cleanSlug,
      };
    } catch {
      return {
        available: true,
        slug: cleanSlug,
      };
    }
  }

  async onboardCompany(userId: string, dto: OnboardCompanyDto) {
    const selectedPlanCode = (dto.planCode || 'FREE').toUpperCase();
    this.logger.log(
      `Initiating company onboarding for User ${userId}: ${dto.orgName} [Plan: ${selectedPlanCode}]`,
    );

    let slug = dto.orgSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-');

    try {
      const existingCompany = await this.prisma.company.findUnique({
        where: { slug },
      });
      if (existingCompany) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    } catch {}

    const isUuid =
      typeof userId === 'string' &&
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        userId,
      );
    if (isUuid) {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (existingUser && existingUser.companyId) {
        throw new ConflictException(
          'User is already assigned to an organization workspace. Please access your existing workspace or contact support.',
        );
      }
    }

    const tierLimits =
      selectedPlanCode === 'ENTERPRISE'
        ? ENTERPRISE_TIER_LIMITS
        : selectedPlanCode === 'PRO' || selectedPlanCode === 'GROWTH'
          ? GROWTH_TIER_LIMITS
          : FREE_TIER_LIMITS;

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create Company
      const company = await tx.company.create({
        data: {
          name: dto.orgName,
          slug,
          slogan: dto.slogan || null,
          primaryColor: dto.brandColor || '#0A84FF',
        },
      });

      const companyId = company.id;

      // 1b. Create OrgSettings & OrgIntelligence
      try {
        await tx.orgSettings.create({
          data: {
            companyId,
            industry: dto.industry || 'Technology',
            aiTone: dto.aiStyle || 'Professional',
          },
        });
      } catch {}

      try {
        await tx.orgIntelligence.create({
          data: {
            companyId,
            identityData: {
              industry: dto.industry || 'Technology',
              customerType: dto.customerType || 'Enterprise',
              businessDesc: dto.businessDesc || dto.slogan || '',
              goals: dto.goals || [],
              companySize: dto.companySize || '1-10',
            },
          },
        });
      } catch {}

      // 2. Find or create the Plan record
      let plan = await tx.plan.findUnique({
        where: { code: selectedPlanCode },
      });
      if (!plan) {
        plan = await tx.plan.create({
          data: {
            name:
              selectedPlanCode === 'FREE'
                ? 'Free Starter'
                : selectedPlanCode === 'PRO' || selectedPlanCode === 'GROWTH'
                  ? 'Growth Scale'
                  : 'Enterprise OS',
            code: selectedPlanCode,
            description:
              selectedPlanCode === 'FREE'
                ? `Free tier: ${FREE_TIER_LIMITS.MONTHLY_CREDITS} AI monthly credits, ${FREE_TIER_LIMITS.ACTIVE_MISSIONS} active mission`
                : selectedPlanCode === 'PRO' || selectedPlanCode === 'GROWTH'
                  ? `Growth tier: ${GROWTH_TIER_LIMITS.MONTHLY_CREDITS.toLocaleString()} AI monthly credits, ${GROWTH_TIER_LIMITS.ACTIVE_MISSIONS} active missions`
                  : `Enterprise tier: ${ENTERPRISE_TIER_LIMITS.MONTHLY_CREDITS.toLocaleString()} AI monthly credits, unlimited missions`,
          },
        });
      }

      // 3. Provision Subscription
      const subscription = await tx.subscription.create({
        data: {
          companyId,
          planId: plan.id,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          trialStart: new Date(),
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      // 4. Provision Usage Records
      const activeMissionsLimit =
        selectedPlanCode === 'ENTERPRISE'
          ? 9999
          : selectedPlanCode === 'PRO' || selectedPlanCode === 'GROWTH'
            ? GROWTH_TIER_LIMITS.ACTIVE_MISSIONS
            : FREE_TIER_LIMITS.ACTIVE_MISSIONS;

      await tx.usageRecord.createMany({
        data: [
          {
            companyId,
            type: 'CREDITS',
            quantity: tierLimits.MONTHLY_CREDITS,
            resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          {
            companyId,
            type: 'MISSIONS',
            quantity: activeMissionsLimit,
            resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        ],
      });

      // 5. Provision Organization Virtual Wallet
      await tx.organizationWallet.create({
        data: {
          companyId,
          balanceUsd: 0,
          currency: 'USD',
          status: 'ACTIVE',
        },
      });

      // 6. Create Departments — scoped to this org with fallback safety
      const createdDepartments: any[] = [];
      const incomingDepts =
        Array.isArray(dto.departments) && dto.departments.length > 0
          ? dto.departments
          : ['Executive Leadership'];

      for (const item of incomingDepts) {
        const deptName =
          typeof item === 'string'
            ? item.trim()
            : (item as any)?.name || 'Executive Leadership';
        if (!deptName) continue;
        const dept = await tx.department.create({
          data: {
            name: deptName,
            companyId,
            isDefaultRoster: deptName.toLowerCase().includes('executive'),
          },
        });
        createdDepartments.push(dept);
      }

      if (createdDepartments.length === 0) {
        const defaultDept = await tx.department.create({
          data: {
            name: 'Executive Leadership',
            companyId,
            isDefaultRoster: true,
          },
        });
        createdDepartments.push(defaultDept);
      }

      // 7. Create AI Executives — always create NEW records scoped to this org's department
      const createdExecutives: any[] = [];
      if (dto.aiExecs && dto.aiExecs.length > 0) {
        for (const execDto of dto.aiExecs) {
          const matchingDept =
            createdDepartments.find((d) => d.name === execDto.departmentName) ||
            createdDepartments[0];

          const orgScopedRoleKey = `${execDto.roleKey}_${companyId.slice(0, 8)}`;

          const exec = await tx.executive.create({
            data: {
              name: execDto.customName || execDto.title || 'AI Executive',
              roleKey: orgScopedRoleKey,
              title: execDto.title || 'Executive Director',
              departmentId: matchingDept.id,
              isActiveInWorkspace: true,
            },
          });
          createdExecutives.push(exec);
        }
      }

      // 8. Update or create User — assign to this company as ORGANIZATION_OWNER
      const isUuid =
        typeof userId === 'string' &&
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          userId,
        );
      let user: any = null;
      if (isUuid) {
        user = await tx.user.findUnique({ where: { id: userId } });
      }

      if (user) {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            companyId,
            role: 'ORGANIZATION_OWNER',
            ...(dto.userDisplayName && {
              displayName: dto.userDisplayName,
              name: dto.userDisplayName,
            }),
          },
          include: { company: true },
        });
      } else {
        user = await tx.user.create({
          data: {
            email: `owner_${Date.now()}@netify.ng`,
            name: dto.userDisplayName || 'Organization Owner',
            role: 'ORGANIZATION_OWNER',
            companyId,
          },
          include: { company: true },
        });
      }

      // 9. Issue a fresh JWT with the new companyId bound to this org
      const token = this.authService.signJwt({
        uid: user.id,
        email: user.email,
        companyId,
        role: 'ORGANIZATION_OWNER',
      });

      return {
        token,
        company,
        subscription,
        plan,
        departments: createdDepartments,
        executives: createdExecutives,
        user,
      };
    });

    this.logger.log(
      `Onboarding complete: ${result.company.name} (${result.company.id}) on ${selectedPlanCode} for User ${userId}`,
    );

    return result;
  }

  async getCompany(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Organization not found');
    return company;
  }
}
