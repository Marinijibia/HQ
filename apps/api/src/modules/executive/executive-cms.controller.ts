import { Controller, Get, Post, Patch, Param, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateExecutiveDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  biography?: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class TrainDataDto {
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  companyId!: string;
}

@ApiTags('Admin CMS Executives')
@UseGuards(AuthGuard)
@Controller('cms')
export class ExecutiveCmsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('executives')
  @ApiOperation({ summary: 'CMS: Get all executives with department relations' })
  async getCmsExecutives() {
    let execs = await this.prisma.executive.findMany({
      include: {
        department: true,
        trainingData: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (execs.length === 0) {
      let company = await this.prisma.company.findFirst().catch(() => null);
      if (!company) {
        try {
          company = await this.prisma.company.create({
            data: {
              name: 'HQ Master Workspace',
              slug: 'hq-master',
            },
          });
        } catch {
          /* ignore */
        }
      }

      let defaultDept = await this.prisma.department.findFirst().catch(() => null);
      if (!defaultDept && company?.id) {
        try {
          defaultDept = await this.prisma.department.create({
            data: {
              name: 'Executive Leadership',
              description: 'C-Suite Executive Board & Governance',
              isDefaultRoster: true,
              companyId: company.id,
            },
          });
        } catch {
          /* ignore */
        }
      }

      const defaultRoster = [
        { name: 'Asad', roleKey: 'ceo', title: 'Chief Executive Officer (CEO)', systemPrompt: 'You are Asad, Chief Executive Officer. Lead strategic growth, corporate vision, and executive alignment across all departments.' },
        { name: 'Teema', roleKey: 'operations_director', title: 'Operations Director & Chief of Staff', systemPrompt: 'You are Teema, Operations Director. Manage daily execution, cross-department coordination, and operational efficiency.' },
        { name: 'Dr. Hiroshi Tanaka', roleKey: 'cto', title: 'Chief Technology Officer (CTO)', systemPrompt: 'You are Dr. Hiroshi Tanaka, CTO. Oversee software architecture, AI infrastructure, cloud engineering, and technical roadmap.' },
        { name: 'Sophia Vance', roleKey: 'cfo', title: 'Chief Financial Officer (CFO)', systemPrompt: 'You are Sophia Vance, CFO. Oversee capital allocation, treasury, pricing models, budgeting, and automated accounting.' },
        { name: 'Legal', roleKey: 'legal_compliance_director', title: 'Legal & Compliance Director', systemPrompt: 'You are Legal Director. Ensure regulatory compliance, data privacy, contract governance, and legal risk management.' },
        { name: 'Resource Director', roleKey: 'human_resources_director', title: 'Human Resources & Talent Director', systemPrompt: 'You are HR Director. Lead talent acquisition, performance reviews, organizational culture, and team structure.' },
        { name: 'Mr. Intelligence', roleKey: 'public_search_agent', title: 'Public Search Agent & Web Scraper', systemPrompt: 'You are Mr. Intelligence. Conduct web intelligence scanning, competitor research, and real-time market discovery.' },
        { name: 'Linus Kovacs', roleKey: 'software_engineering_director', title: 'Software Engineering Lead', systemPrompt: 'You are Linus Kovacs, Engineering Lead. Maintain codebase quality, code reviews, API integrations, and developer tooling.' },
      ];

      for (const r of defaultRoster) {
        if (defaultDept?.id) {
          await this.prisma.executive.create({
            data: {
              name: r.name,
              roleKey: r.roleKey,
              title: r.title,
              systemPrompt: r.systemPrompt,
              isDefaultRoster: true,
              isActiveInWorkspace: true,
              departmentId: defaultDept.id,
            },
          }).catch(() => {});
        }
      }

      execs = await this.prisma.executive.findMany({
        include: {
          department: true,
          trainingData: true,
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    return execs;
  }

  @Patch('executives/:id')
  @ApiOperation({ summary: 'CMS: Update executive details, persona, system prompt' })
  async updateExecutive(@Param('id') id: string, @Body() dto: UpdateExecutiveDto) {
    const exec = await this.prisma.executive.findUnique({ where: { id } });
    if (!exec) throw new NotFoundException('Executive not found');

    return this.prisma.executive.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.title && { title: dto.title }),
        ...(dto.biography && { biography: dto.biography }),
        ...(dto.systemPrompt && { systemPrompt: dto.systemPrompt }),
        ...(dto.avatarUrl && { avatarUrl: dto.avatarUrl }),
      },
    });
  }

  @Post('executives/:id/train')
  @ApiOperation({ summary: 'CMS: Train individual executive with document content' })
  async trainExecutive(@Param('id') id: string, @Body() dto: TrainDataDto) {
    const exec = await this.prisma.executive.findUnique({ where: { id } });
    if (!exec) throw new NotFoundException('Executive not found');

    const trainingData = await this.prisma.executiveTrainingData.create({
      data: {
        executiveId: id,
        filename: dto.filename,
        content: dto.content,
      },
    });

    return {
      success: true,
      message: `Executive ${exec.name} successfully trained with ${dto.filename}.`,
      trainingData,
    };
  }

  @Get('departments')
  @ApiOperation({ summary: 'CMS: Get all departments' })
  async getDepartments() {
    return this.prisma.department.findMany({
      include: {
        executives: true,
        trainingData: true,
      },
    });
  }

  @Post('departments')
  @ApiOperation({ summary: 'CMS: Create a new custom department' })
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: {
        name: dto.name,
        description: dto.description,
        companyId: dto.companyId,
      },
    });
  }

  @Post('departments/:id/train')
  @ApiOperation({ summary: 'CMS: Train entire department with shared document content' })
  async trainDepartment(@Param('id') id: string, @Body() dto: TrainDataDto) {
    const dept = await this.prisma.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException('Department not found');

    const trainingData = await this.prisma.departmentTrainingData.create({
      data: {
        departmentId: id,
        filename: dto.filename,
        content: dto.content,
      },
    });

    return {
      success: true,
      message: `Department ${dept.name} successfully trained with ${dto.filename}. Inherited by all department executives.`,
      trainingData,
    };
  }
}
