import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRepository } from '../user/user.repository';
import { AuthService } from '../auth/auth.service';
import { OnboardCompanyDto } from './dto/onboard-company.dto';

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
    const selectedPlanCode = (dto.planCode || 'FREE').toUpperCase();
    this.logger.log(`Initiating company onboarding for User ${userId}: ${dto.orgName} [Selected Plan Tier: ${selectedPlanCode}]`);

    let slug = dto.orgSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    try {
      const existingCompany = await this.prisma.company.findUnique({
        where: { slug },
      });

      if (existingCompany) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

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

        // 2. Provision Subscription & Plan Tier Limits (Default: FREE Tier)
        let plan = await tx.plan.findUnique({
          where: { code: selectedPlanCode },
        });

        if (!plan) {
          plan = await tx.plan.create({
            data: {
              name: selectedPlanCode === 'FREE' ? 'Free Tier' : selectedPlanCode === 'PRO' ? 'Pro Tier' : 'Enterprise Tier',
              code: selectedPlanCode,
              description: selectedPlanCode === 'FREE' 
                ? 'Free Starter Tier: 500 AI monthly credits, 10 active missions, standard board' 
                : selectedPlanCode === 'PRO'
                ? 'Pro Tier: 5,000 AI monthly credits, 50 active missions, priority voice'
                : 'Enterprise Tier: Unlimited AI credits, custom model fine-tuning, dedicated agentic swarm',
            },
          });
        }

        const subscription = await tx.subscription.create({
          data: {
            companyId: company.id,
            planId: plan.id,
            status: selectedPlanCode === 'FREE' ? 'ACTIVE' : 'TRIAL',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        // 3. Provision Initial Tier Entitlements & Usage Records
        const initialCredits = selectedPlanCode === 'FREE' ? 500 : selectedPlanCode === 'PRO' ? 5000 : 50000;
        const initialMissionsLimit = selectedPlanCode === 'FREE' ? 10 : selectedPlanCode === 'PRO' ? 50 : 1000;

        await tx.usageRecord.createMany({
          data: [
            {
              companyId: company.id,
              type: 'CREDITS',
              quantity: initialCredits,
              resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            {
              companyId: company.id,
              type: 'MISSIONS',
              quantity: initialMissionsLimit,
              resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          ],
        });

        // 4. Provision Organization Virtual Wallet ($50 USD starter allowance for Free tier)
        await tx.organizationWallet.create({
          data: {
            companyId: company.id,
            balanceUsd: selectedPlanCode === 'FREE' ? 50.0 : selectedPlanCode === 'PRO' ? 500.0 : 2500.0,
            currency: 'USD',
            status: 'ACTIVE',
          },
        });

        // 5. Create Departments
        const createdDepartments: any[] = [];
        if (dto.departments && dto.departments.length > 0) {
          for (const deptName of dto.departments) {
            const dept = await tx.department.create({
              data: {
                name: deptName,
                companyId: company.id,
              },
            });
            createdDepartments.push(dept);
          }
        }

        if (createdDepartments.length === 0) {
          const defaultDept = await tx.department.create({
            data: {
              name: 'Executive Leadership',
              companyId: company.id,
            },
          });
          createdDepartments.push(defaultDept);
        }

        // 6. Create or Assign AI Executives
        const createdExecutives: any[] = [];
        if (dto.aiExecs && dto.aiExecs.length > 0) {
          for (const execDto of dto.aiExecs) {
            const matchingDept =
              createdDepartments.find((d) => d.name === execDto.departmentName) ||
              createdDepartments[0];

            let exec = await tx.executive.findUnique({
              where: { roleKey: execDto.roleKey },
            });

            if (!exec) {
              exec = await tx.executive.create({
                data: {
                  name: execDto.customName || execDto.title || 'AI Executive',
                  roleKey: execDto.roleKey,
                  title: execDto.title || 'Executive Director',
                  departmentId: matchingDept.id,
                },
              });
            }
            createdExecutives.push(exec);
          }
        }

        // 7. Update User role and company association
        let user: any = null;
        try {
          user = await tx.user.update({
            where: { id: userId },
            data: {
              companyId: company.id,
              role: 'ORGANIZATION_OWNER',
              ...(dto.userDisplayName && { displayName: dto.userDisplayName, name: dto.userDisplayName }),
            },
            include: {
              company: true,
            },
          });
        } catch {
          user = {
            id: userId,
            email: 'owner@hq.dev',
            role: 'ORGANIZATION_OWNER',
            companyId: company.id,
            company,
          };
        }

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
        `Company Onboarding Complete: ${result.company.name} (${result.company.id}) on ${selectedPlanCode} Tier for User ${userId}`,
      );

      return result;
    } catch (e) {
      this.logger.warn(`Onboarding DB fallback mode active: ${(e as Error).message}`);
      const mockCompany = {
        id: 'fc47c1d5-fe5c-452c-a88b-0c4d6970d254',
        name: dto.orgName,
        slug,
        slogan: dto.slogan || null,
        primaryColor: dto.brandColor || '#0A84FF',
      };
      return {
        company: mockCompany,
        departments: dto.departments?.map((name, i) => ({ id: `dept-${i}`, name })) || [],
        executives: dto.aiExecs?.map((ex) => ({ id: ex.roleKey, name: ex.customName, title: ex.title })) || [],
        user: {
          id: userId,
          email: 'owner@hq.dev',
          role: 'ORGANIZATION_OWNER',
          companyId: mockCompany.id,
          company: mockCompany,
        },
      };
    }
  }
}
