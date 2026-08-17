import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
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

  /** Gracefully resolve tenant context strictly from verified authenticated user context */
  private async getCompanyId(req: any): Promise<string> {
    const candidate = req.user?.companyId;
    return this.prisma.resolveCompanyId(candidate);
  }

  @Get('executives')
  @ApiOperation({
    summary: 'CMS: Get all executives with department relations',
  })
  async getCmsExecutives(@Req() req: any) {
    const companyId = await this.getCompanyId(req);

    // Retrieve active executives strictly scoped to current tenant organization
    let execs = await this.prisma.executive.findMany({
      where: {
        department: {
          companyId,
        },
      },
      include: {
        department: true,
        trainingData: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // If no executives exist in the workspace, seed the 5 Core Baseline Roster
    if (execs.length === 0) {
      this.logger.log(
        `[CMS] No executives found in workspace ${companyId}. Seeding 5 Core Baseline Roster.`,
      );

      let defaultDept = await this.prisma.department.findFirst({
        where: { isDefaultRoster: true, companyId },
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
          systemPrompt:
            'You are Asad, Chief Executive Officer. Lead strategic growth, corporate vision, and executive alignment across all departments.',
        },
        {
          name: 'Teema',
          roleKey: 'operations_director',
          title: 'Operations Director & Chief of Staff',
          systemPrompt:
            'You are Teema, Operations Director. Manage daily execution, cross-department coordination, and operational efficiency.',
        },
        {
          name: 'Hassan',
          roleKey: 'cto',
          title: 'Chief Technology Officer (CTO)',
          systemPrompt:
            'You are Hassan, Chief Technology Officer. Oversee architecture, scalable infrastructure, systems integrity, and edge compute performance.',
        },
        {
          name: 'Mustapha',
          roleKey: 'cfo',
          title: 'Chief Financial Officer (CFO)',
          systemPrompt:
            'You are Mustapha, Chief Financial Officer. Drive financial strategy, unit economics, risk management, and capital allocation.',
        },
        {
          name: 'Nabila',
          roleKey: 'cmo',
          title: 'Chief Marketing Officer (CMO)',
          systemPrompt:
            'You are Nabila, Chief Marketing Officer. Lead global brand awareness, digital acquisitions, growth loops, and public narrative.',
        },
      ];

      for (const r of defaultRoster) {
        await this.prisma.executive
          .create({
            data: {
              name: r.name,
              roleKey: r.roleKey,
              title: r.title,
              systemPrompt: r.systemPrompt,
              departmentId: deptId,
              isActiveInWorkspace: true,
            },
          })
          .catch(() => {});
      }

      execs = await this.prisma.executive.findMany({
        where: {
          department: {
            companyId,
          },
        },
        include: {
          department: true,
          trainingData: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    return execs;
  }

  @Patch('executives/:id')
  @ApiOperation({
    summary: 'CMS: Update executive details, persona, system prompt',
  })
  async updateExecutive(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateExecutiveDto,
  ) {
    const companyId = await this.getCompanyId(req);
    const exec = await this.prisma.executive.findFirst({
      where: { id, department: { companyId } },
    });
    if (!exec) throw new NotFoundException('Executive not found in your organization workspace');

    return this.prisma.executive.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.title && { title: dto.title }),
        ...(dto.biography && { biography: dto.biography }),
        ...(dto.systemPrompt && { systemPrompt: dto.systemPrompt }),
        ...(dto.avatarUrl && { avatarUrl: dto.avatarUrl }),
      },
      include: {
        department: true,
        trainingData: true,
      },
    });
  }

  @Post('executives/:id/train')
  @ApiOperation({
    summary:
      'CMS: Train individual executive with document content and auto-chunk for vector indexing',
  })
  async trainExecutive(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: TrainDataDto,
  ) {
    const companyId = await this.getCompanyId(req);
    const exec = await this.prisma.executive.findFirst({
      where: { id, department: { companyId } },
      include: { department: true },
    });
    if (!exec) throw new NotFoundException('Executive not found in your organization workspace');

    const trainingData = await this.prisma.executiveTrainingData.create({
      data: {
        executiveId: id,
        filename: dto.filename,
        content: dto.content,
      },
    });

    // Auto-trigger background vector re-indexing asynchronously
    this.vectorReindexService.reindexAllTrainingData(companyId).catch((err) => {
      this.logger.warn(`Auto re-index notice for ${dto.filename}: ${err}`);
    });

    return {
      success: true,
      message: `Executive ${exec.name} successfully trained with "${dto.filename}". Semantic vector indexing registered.`,
      trainingData,
    };
  }

  @Delete('executives/training/:trainingId')
  @ApiOperation({ summary: 'CMS: Delete training document from executive' })
  async deleteExecutiveTraining(
    @Req() req: any,
    @Param('trainingId') trainingId: string,
  ) {
    const companyId = await this.getCompanyId(req);
    const existing = await this.prisma.executiveTrainingData.findFirst({
      where: { id: trainingId, executive: { department: { companyId } } },
    });
    if (!existing) throw new NotFoundException('Training document not found in your organization workspace');

    await this.prisma.executiveTrainingData.delete({
      where: { id: trainingId },
    });
    return {
      success: true,
      message: `Removed training document "${existing.filename}"`,
    };
  }

  @Post('reindex-vectors')
  @ApiOperation({
    summary: 'CMS: Trigger automated vector re-indexing for platform',
  })
  async reindexVectors(@Req() req: any) {
    const companyId = await this.getCompanyId(req);
    const stats =
      await this.vectorReindexService.reindexAllTrainingData(companyId);

    return {
      success: true,
      message: `Vector re-indexing completed. Evaluated ${stats.totalChunksProcessed} total Markdown document chunks in pgvector.`,
      stats,
    };
  }

  @Get('departments')
  @ApiOperation({ summary: 'CMS: Get all departments' })
  async getDepartments(@Req() req: any) {
    const companyId = await this.getCompanyId(req);
    return this.prisma.department.findMany({
      where: { companyId },
      include: {
        executives: true,
        trainingData: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Post('departments')
  @ApiOperation({ summary: 'CMS: Create a new custom department' })
  async createDepartment(@Req() req: any, @Body() dto: CreateDepartmentDto) {
    const companyId = await this.getCompanyId(req);
    return this.prisma.department.create({
      data: {
        name: dto.name,
        description: dto.description,
        companyId,
      },
    });
  }

  @Post('departments/:id/train')
  @ApiOperation({
    summary: 'CMS: Train entire department with shared document content',
  })
  async trainDepartment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: TrainDataDto,
  ) {
    const companyId = await this.getCompanyId(req);
    const dept = await this.prisma.department.findFirst({
      where: { id, companyId },
    });
    if (!dept) throw new NotFoundException('Department not found in your organization workspace');

    const trainingData = await this.prisma.departmentTrainingData.create({
      data: {
        departmentId: id,
        filename: dto.filename,
        content: dto.content,
      },
    });

    this.vectorReindexService.reindexAllTrainingData(companyId).catch((err) => {
      this.logger.warn(`Auto dept re-index notice for ${dto.filename}: ${err}`);
    });

    return {
      success: true,
      message: `Department ${dept.name} successfully trained with "${dto.filename}". Inherited by all department executives.`,
      trainingData,
    };
  }

  @Delete('departments/training/:trainingId')
  @ApiOperation({ summary: 'CMS: Delete training document from department' })
  async deleteDepartmentTraining(
    @Req() req: any,
    @Param('trainingId') trainingId: string,
  ) {
    const companyId = await this.getCompanyId(req);
    const existing = await this.prisma.departmentTrainingData.findFirst({
      where: { id: trainingId, department: { companyId } },
    });
    if (!existing)
      throw new NotFoundException('Department training document not found in your organization workspace');

    await this.prisma.departmentTrainingData.delete({
      where: { id: trainingId },
    });
    return {
      success: true,
      message: `Removed department training document "${existing.filename}"`,
    };
  }
}
