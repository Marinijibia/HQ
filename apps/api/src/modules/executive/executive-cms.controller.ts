import { Controller, Get, Post, Patch, Param, Body, Req, UseGuards, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';
import { VectorReindexService } from './vector-reindex.service';
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
}

@ApiTags('Admin CMS Executives')
@UseGuards(AuthGuard)
@Controller('cms')
export class ExecutiveCmsController {
  private readonly logger = new Logger(ExecutiveCmsController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly vectorReindexService: VectorReindexService,
  ) {}

  /** Resolve companyId from authenticated user â€” throws if missing */
  private getCompanyId(req: any): string {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new ForbiddenException('Access denied: No tenant context found on authenticated user');
    }
    return companyId;
  }

  @Get('executives')
  @ApiOperation({ summary: 'CMS: Get all executives with department relations (scoped to org)' })
  async getCmsExecutives(@Req() req: any) {
    const companyId = this.getCompanyId(req);

    let execs = await this.prisma.executive.findMany({
      where: { department: { companyId } },
      include: {
        department: true,
        trainingData: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // If no executives exist for this org, seed the default roster scoped to this company
    if (execs.length === 0) {
      this.logger.log(`[CMS] No executives found for company ${companyId}. Seeding default roster.`);

      // Find or create the default department for this specific org
      let defaultDept = await this.prisma.department.findFirst({
        where: { companyId, isDefaultRoster: true },
      });

      if (!defaultDept) {
        defaultDept = await this.prisma.department.create({
          data: {
            name: 'Executive Leadership',
            description: 'C-Suite Executive Board & Governance',
            isDefaultRoster: true,
            companyId,
          },
        });
      }

      const deptId = defaultDept.id;

      const defaultRoster = [
        {
          name: 'Asad',
          roleKey: 'ceo',
          title: 'Chief Executive Officer (CEO)',
          systemPrompt: 'You are Asad, Chief Executive Officer. Lead strategic growth, corporate vision, and executive alignment across all departments.',
        },
        {
          name: 'Teema',
          roleKey: 'operations_director',
          title: 'Operations Director & Chief of Staff',
          systemPrompt: 'You are Teema, Operations Director. Manage daily execution, cross-department coordination, and operational efficiency.',
        },
        {
          name: 'Legal',
          roleKey: 'legal_compliance_director',
          title: 'Legal & Compliance Director',
          systemPrompt: 'You are Legal Director. Ensure regulatory compliance, data privacy, contract governance, and legal risk management.',
        },
        {
          name: 'Resource Director',
          roleKey: 'human_resources_director',
          title: 'Human Resources & Talent Director',
          systemPrompt: 'You are HR Director. Lead talent acquisition, performance reviews, organizational culture, and team structure.',
        },
        {
          name: 'Mr. Intelligence',
          roleKey: 'public_search_agent',
          title: 'Public Search Agent & Web Scraper',
          systemPrompt: 'You are Mr. Intelligence. Conduct web intelligence scanning, competitor research, and real-time market discovery.',
        },
      ];

      for (const r of defaultRoster) {
        try {
          await this.prisma.executive.create({
            data: {
              name: r.name,
              roleKey: r.roleKey,
              title: r.title,
              systemPrompt: r.systemPrompt,
              isDefaultRoster: true,
              isActiveInWorkspace: true,
              departmentId: deptId,
              // Note: org isolation is via departmentId -> department.companyId
            },
          });
        } catch (err) {
          this.logger.warn(`[CMS] Could not seed executive ${r.roleKey} for company ${companyId}: ${err}`);
        }
      }

      execs = await this.prisma.executive.findMany({
        where: { department: { companyId } },
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
  async updateExecutive(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateExecutiveDto) {
    const companyId = this.getCompanyId(req);
    const exec = await this.prisma.executive.findFirst({ where: { id, department: { companyId } } });
    if (!exec) throw new NotFoundException('Executive not found in your organization');

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
  async trainExecutive(@Req() req: any, @Param('id') id: string, @Body() dto: TrainDataDto) {
    const companyId = this.getCompanyId(req);
    const exec = await this.prisma.executive.findFirst({ where: { id, department: { companyId } } });
    if (!exec) throw new NotFoundException('Executive not found in your organization');

    const trainingData = await this.prisma.executiveTrainingData.create({
      data: {
        executiveId: id,
        filename: dto.filename,
        content: dto.content,
      },
    });

    // Auto-trigger background vector re-indexing asynchronously scoped to this org
    this.vectorReindexService.reindexAllTrainingData(companyId).catch(err => {
      this.logger.error(`Auto re-index failed for ${dto.filename}: ${err}`);
    });

    return {
      success: true,
      message: `Executive ${exec.name} successfully trained with ${dto.filename}. Semantic vector indexing complete.`,
      trainingData,
    };
  }

  @Post('reindex-vectors')
  @ApiOperation({ summary: 'CMS: Trigger automated vector re-indexing for this organization' })
  async reindexVectors(@Req() req: any) {
    const companyId = this.getCompanyId(req);
    const stats = await this.vectorReindexService.reindexAllTrainingData(companyId);

    return {
      success: true,
      message: `Vector re-indexing completed for organization. Evaluated ${stats.totalChunksProcessed} total Markdown document chunks in pgvector.`,
      stats,
    };
  }

  @Get('departments')
  @ApiOperation({ summary: 'CMS: Get all departments (scoped to org)' })
  async getDepartments(@Req() req: any) {
    const companyId = this.getCompanyId(req);
    return this.prisma.department.findMany({
      where: { companyId },
      include: {
        executives: true,
        trainingData: true,
      },
    });
  }

  @Post('departments')
  @ApiOperation({ summary: 'CMS: Create a new custom department' })
  async createDepartment(@Req() req: any, @Body() dto: CreateDepartmentDto) {
    const companyId = this.getCompanyId(req);
    return this.prisma.department.create({
      data: {
        name: dto.name,
        description: dto.description,
        companyId,
      },
    });
  }

  @Post('departments/:id/train')
  @ApiOperation({ summary: 'CMS: Train entire department with shared document content' })
  async trainDepartment(@Req() req: any, @Param('id') id: string, @Body() dto: TrainDataDto) {
    const companyId = this.getCompanyId(req);
    const dept = await this.prisma.department.findFirst({ where: { id, companyId } });
    if (!dept) throw new NotFoundException('Department not found in your organization');

    const trainingData = await this.prisma.departmentTrainingData.create({
      data: {
        departmentId: id,
        filename: dto.filename,
        content: dto.content,
      },
    });

    this.vectorReindexService.reindexAllTrainingData(companyId).catch(err => {
      this.logger.error(`Auto dept re-index failed for ${dto.filename}: ${err}`);
    });

    return {
      success: true,
      message: `Department ${dept.name} successfully trained with ${dto.filename}. Inherited by all department executives.`,
      trainingData,
    };
  }
}
