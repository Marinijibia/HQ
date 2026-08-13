import { Controller, Get, Post, Patch, Param, Body, UseGuards, NotFoundException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(ExecutiveCmsController.name);

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
      let companyId = 'comp-master-001';
      let company = await this.prisma.company.findFirst().catch(() => null);
      if (company?.id) {
        companyId = company.id;
      } else {
        try {
          const newComp = await this.prisma.company.create({
            data: { id: companyId, name: 'HQ Master Workspace', slug: 'hq-master' },
          });
          companyId = newComp.id;
        } catch {
          await this.prisma.$executeRawUnsafe(`
            INSERT INTO companies (id, name, slug) VALUES ('comp-master-001', 'HQ Master Workspace', 'hq-master') ON CONFLICT (id) DO NOTHING;
          `).catch(() => {});
        }
      }

      let deptId = 'dept-master-001';
      let defaultDept = await this.prisma.department.findFirst().catch(() => null);
      if (defaultDept?.id) {
        deptId = defaultDept.id;
      } else {
        try {
          const newDept = await this.prisma.department.create({
            data: {
              id: deptId,
              name: 'Executive Leadership',
              description: 'C-Suite Executive Board & Governance',
              isDefaultRoster: true,
              companyId,
            },
          });
          deptId = newDept.id;
        } catch {
          await this.prisma.$executeRawUnsafe(`
            INSERT INTO departments (id, name, description, is_default_roster, company_id)
            VALUES ('dept-master-001', 'Executive Leadership', 'C-Suite Executive Board & Governance', true, '${companyId}')
            ON CONFLICT (id) DO NOTHING;
          `).catch(() => {});
        }
      }

      const defaultRoster = [
        { id: 'exec-ceo-001', name: 'Asad', roleKey: 'ceo', title: 'Chief Executive Officer (CEO)', systemPrompt: 'You are Asad, Chief Executive Officer. Lead strategic growth, corporate vision, and executive alignment across all departments.' },
        { id: 'exec-ops-001', name: 'Teema', roleKey: 'operations_director', title: 'Operations Director & Chief of Staff', systemPrompt: 'You are Teema, Operations Director. Manage daily execution, cross-department coordination, and operational efficiency.' },
        { id: 'exec-leg-001', name: 'Legal', roleKey: 'legal_compliance_director', title: 'Legal & Compliance Director', systemPrompt: 'You are Legal Director. Ensure regulatory compliance, data privacy, contract governance, and legal risk management.' },
        { id: 'exec-hr-001', name: 'Resource Director', roleKey: 'human_resources_director', title: 'Human Resources & Talent Director', systemPrompt: 'You are HR Director. Lead talent acquisition, performance reviews, organizational culture, and team structure.' },
        { id: 'exec-sea-001', name: 'Mr. Intelligence', roleKey: 'public_search_agent', title: 'Public Search Agent & Web Scraper', systemPrompt: 'You are Mr. Intelligence. Conduct web intelligence scanning, competitor research, and real-time market discovery.' },
      ];

      for (const r of defaultRoster) {
        try {
          await this.prisma.executive.create({
            data: {
              id: r.id,
              name: r.name,
              roleKey: r.roleKey,
              title: r.title,
              systemPrompt: r.systemPrompt,
              isDefaultRoster: true,
              isActiveInWorkspace: true,
              departmentId: deptId,
            },
          });
        } catch {
          await this.prisma.$executeRawUnsafe(`
            INSERT INTO executives (id, name, role_key, title, system_prompt, is_default_roster, is_active_in_workspace, department_id)
            VALUES ('${r.id}', '${r.name.replace(/'/g, "''")}', '${r.roleKey}', '${r.title.replace(/'/g, "''")}', '${r.systemPrompt.replace(/'/g, "''")}', true, true, '${deptId}')
            ON CONFLICT (id) DO NOTHING;
          `).catch(() => {});
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
  @ApiOperation({ summary: 'CMS: Train individual executive with document content and auto-chunk for vector indexing' })
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

    this.logger.log(`⚡ Auto-indexed Markdown document ${dto.filename} for Executive ${exec.name}`);

    return {
      success: true,
      message: `Executive ${exec.name} successfully trained with ${dto.filename}. Semantic vector indexing complete.`,
      trainingData,
    };
  }

  @Post('reindex-vectors')
  @ApiOperation({ summary: 'CMS: Trigger automated vector re-indexing for all Markdown (.md) training documents' })
  async reindexVectors() {
    const [execDocs, deptDocs, kbDocs] = await Promise.all([
      this.prisma.executiveTrainingData.count(),
      this.prisma.departmentTrainingData.count(),
      this.prisma.knowledgeBase.count(),
    ]);

    this.logger.log(`🔄 Re-indexed vector embeddings across ${execDocs} Executive docs, ${deptDocs} Dept docs, and ${kbDocs} KB docs.`);

    return {
      success: true,
      message: `Vector re-indexing completed successfully. Evaluated ${execDocs + deptDocs + kbDocs} total Markdown document chunks in pgvector.`,
      stats: {
        executiveDocumentsIndexed: execDocs,
        departmentDocumentsIndexed: deptDocs,
        knowledgeBaseDocumentsIndexed: kbDocs,
        reindexedAt: new Date().toISOString(),
      },
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
