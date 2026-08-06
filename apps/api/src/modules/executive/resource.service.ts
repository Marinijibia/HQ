import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AiService } from '../ai/ai.service';

export interface DepartmentCoverage {
  departmentName: string;
  activeDirectorCount: number;
  covered: boolean;
}

export interface RosterCapacityReport {
  totalActiveExecutives: number;
  capacityScore: number; // 0-100%
  capacityStatus: 'OPTIMAL' | 'BALANCED' | 'CAPACITY_CONSTRAINED';
  departmentCoverage: DepartmentCoverage[];
  missingDomains: string[];
  recommendations: string[];
}

@Injectable()
export class ResourceService {
  private readonly logger = new Logger(ResourceService.name);

  private readonly hrSystemPrompt = `
    You are Resource Director, Human Resources & Workgroup Capacity Director of HQ Corporation.
    Your directive is to optimize executive talent allocation, monitor workspace roster capacity, and onboard specialized AI Directors.
    Maintain a professional, talent-focused, and high-efficiency perspective.
  `;

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Executive Skill Matrix & Capacity Auditor
   */
  async auditRosterCapacity(companyId?: string): Promise<RosterCapacityReport> {
    this.logger.log('[Resource Director] Auditing workspace roster capacity and department coverage...');

    const activeExecutives = await this.prisma.executive.findMany({
      where: { isActiveInWorkspace: true },
      include: { department: true },
    });

    const activeDepts = activeExecutives.map((e) => e.department?.name.toLowerCase()).filter(Boolean);

    const standardDomains = [
      { name: 'Executive Office & Management', key: 'management' },
      { name: 'Operations & Project Management', key: 'operations' },
      { name: 'Legal & Governance', key: 'legal' },
      { name: 'Human Resources & Talent', key: 'hr' },
      { name: 'Public Web Research', key: 'research' },
      { name: 'Technology & Software Engineering', key: 'technology' },
      { name: 'Sales & Growth Marketing', key: 'marketing' },
      { name: 'Finance & Capital Strategy', key: 'finance' },
    ];

    const departmentCoverage: DepartmentCoverage[] = standardDomains.map((domain) => {
      const isCovered = activeDepts.some((d) => d?.includes(domain.key) || d?.includes(domain.name.toLowerCase()));
      return {
        departmentName: domain.name,
        activeDirectorCount: activeExecutives.filter((e) => e.department?.name.toLowerCase().includes(domain.key)).length || (isCovered ? 1 : 0),
        covered: isCovered,
      };
    });

    const coveredCount = departmentCoverage.filter((d) => d.covered).length;
    const capacityScore = Math.round((coveredCount / standardDomains.length) * 100);

    let capacityStatus: 'OPTIMAL' | 'BALANCED' | 'CAPACITY_CONSTRAINED' = 'BALANCED';
    if (capacityScore >= 80) capacityStatus = 'OPTIMAL';
    else if (capacityScore < 60) capacityStatus = 'CAPACITY_CONSTRAINED';

    const missingDomains = departmentCoverage.filter((d) => !d.covered).map((d) => d.departmentName);

    const recommendations = missingDomains.map(
      (domain) => `Install the ${domain} Suite from Marketplace to onboard specialized directors.`,
    );

    return {
      totalActiveExecutives: activeExecutives.length,
      capacityScore,
      capacityStatus,
      departmentCoverage,
      missingDomains,
      recommendations,
    };
  }

  /**
   * Automated AI Director Activation / Deactivation
   */
  async activateExecutive(executiveId: string, isActive: boolean): Promise<boolean> {
    this.logger.log(`[Resource Director] Updating executive ${executiveId} active status to: ${isActive}`);

    const exec = await this.prisma.executive.update({
      where: { id: executiveId },
      data: { isActiveInWorkspace: isActive },
    });

    return exec.isActiveInWorkspace;
  }

  /**
   * Onboard a new Specialized AI Director
   */
  async onboardSpecialistDirector(
    departmentId: string,
    name: string,
    title: string,
    roleKey: string,
    biography: string,
    systemPrompt: string,
  ) {
    this.logger.log(`[Resource Director] Onboarding new specialized Director: ${name} (${title})...`);

    return this.prisma.executive.create({
      data: {
        departmentId,
        name,
        title,
        roleKey,
        biography,
        systemPrompt,
        isActiveInWorkspace: true,
      },
    });
  }
}
