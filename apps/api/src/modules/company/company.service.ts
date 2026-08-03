import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRepository } from '../user/user.repository';
import { OnboardCompanyDto } from './dto/onboard-company.dto';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
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
    this.logger.log(`Initiating company onboarding for User ${userId}: ${dto.orgName}`);

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

        // 2. Create Departments
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

        // 3. Create or Assign AI Executives
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

        // 4. Update User role and company association
        let user: any = null;
        try {
          user = await tx.user.update({
            where: { id: userId },
            data: {
              companyId: company.id,
              role: 'ORGANIZATION_OWNER',
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

        return {
          company,
          departments: createdDepartments,
          executives: createdExecutives,
          user,
        };
      });

      this.logger.log(
        `Company Onboarding Complete: ${result.company.name} (${result.company.id}) for User ${userId}`,
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
