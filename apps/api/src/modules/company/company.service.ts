import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRepository } from '../user/user.repository';
import { AuthService } from '../auth/auth.service';
import { OnboardCompanyDto } from './dto/onboard-company.dto';

/** Free tier hard limits — single source of truth */
export const FREE_TIER_LIMITS = {
  ACTIVE_MISSIONS: 1,
  MONTHLY_CREDITS: 500,
  WALLET_STARTER_USD: 0, // Free tier gets no wallet credit
} as const;

export const GROWTH_TIER_LIMITS = {
  ACTIVE_MISSIONS: 10,
  MONTHLY_CREDITS: 25000,
  WALLET_STARTER_USD: 0,
} as const;

export const ENTERPRISE_TIER_LIMITS = {
  ACTIVE_MISSIONS: Infinity,
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
  ) {}

  async checkSlugAvailability(slug: string): Promise<{ available: boolean; slug: string }> {
    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
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
    // Always default to FREE — freemium model
    const selectedPlanCode = (dto.planCode || 'FREE').toUpperCase();
    this.logger.log(
      `Initiating company onboarding for User ${userId}: ${dto.orgName} [Plan: ${selectedPlanCode}]`,
    );

    let slug = dto.orgSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    // Check slug uniqueness before starting transaction
    const existingCompany = await this.prisma.company.findUnique({ where: { slug } });
    if (existingCompany) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Set tier limits based on selected plan
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

      // 2. Find or create the Plan record
      let plan = await tx.plan.findUnique({ where: { code: selectedPlanCode } });
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

      // 3. Provision Subscription — FREE tier is always ACTIVE immediately (no payment required)
      const subscription = await tx.subscription.create({
        data: {
          companyId: company.id,
          planId: plan.id,
          status: 'ACTIVE', // Free tier is always active — no trial, no payment wall
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // 4. Provision Usage Records — limits aligned with entitlement guard
      const activeMissionsLimit =
        selectedPlanCode === 'ENTERPRISE'
          ? 9999 // Represents "unlimited" in the record
          : selectedPlanCode === 'PRO' || selectedPlanCode === 'GROWTH'
          ? GROWTH_TIER_LIMITS.ACTIVE_MISSIONS
          : FREE_TIER_LIMITS.ACTIVE_MISSIONS; // 1 — matches entitlement guard

      await tx.usageRecord.createMany({
        data: [
          {
            companyId: company.id,
            type: 'CREDITS',
            quantity: tierLimits.MONTHLY_CREDITS,
            resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          {
            companyId: company.id,
            type: 'MISSIONS',
            quantity: activeMissionsLimit,
            resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        ],
      });

      // 5. Provision Organization Virtual Wallet
      // Free tier starts with $0 — they earn credits by upgrading
      await tx.organizationWallet.create({
        data: {
          companyId: company.id,
          balanceUsd: 0,
          currency: 'USD',
          status: 'ACTIVE',
        },
      });

      // 6. Create Departments — scoped to this org
      const createdDepartments: any[] = [];
      if (dto.departments && dto.departments.length > 0) {
        for (const deptName of dto.departments) {
          const dept = await tx.department.create({
            data: { name: deptName, companyId: company.id },
          });
          createdDepartments.push(dept);
        }
      }

      if (createdDepartments.length === 0) {
        const defaultDept = await tx.department.create({
          data: { name: 'Executive Leadership', companyId: company.id },
        });
        createdDepartments.push(defaultDept);
      }

      // 7. Create AI Executives — always create NEW records scoped to this org's department
      // Never re-use executives from other orgs (prevents cross-org data leakage)
      const createdExecutives: any[] = [];
      if (dto.aiExecs && dto.aiExecs.length > 0) {
        for (const execDto of dto.aiExecs) {
          const matchingDept =
            createdDepartments.find((d) => d.name === execDto.departmentName) ||
            createdDepartments[0];

          // Generate a unique roleKey per org to prevent cross-org exec sharing
          const orgScopedRoleKey = `${execDto.roleKey}_${company.id.slice(0, 8)}`;

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

      // 8. Update User — assign to this company as ORGANIZATION_OWNER
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          companyId: company.id,
          role: 'ORGANIZATION_OWNER',
          ...(dto.userDisplayName && { displayName: dto.userDisplayName, name: dto.userDisplayName }),
        },
        include: { company: true },
      });

      // 9. Issue a fresh JWT with the new companyId bound to this org
      const token = this.authService.signJwt({
        uid: user.id,
        email: user.email,
        companyId: company.id,
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
    // NOTE: No fallback mock company — if the DB transaction fails, the error propagates
    // to the controller which returns a proper 500. A user must never receive a fake token.
  }

  async getCompany(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Organization not found');
    return company;
  }
}
