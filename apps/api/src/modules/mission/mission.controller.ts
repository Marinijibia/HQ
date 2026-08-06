import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MissionRepository } from './mission.repository';
import { CosService } from './cos.service';
import { MoeService } from './moe.service';
import { CeoOrchestratorService } from './ceo-orchestrator.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { EntitlementGuard } from '../auth/entitlement.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { MissionStatus } from '@prisma/client';
import * as types from '../../common/interfaces/request.interface';
import { PrismaService } from '../database/prisma.service';

export class CreateMissionDto {
  @IsString()
  @IsNotEmpty()
  objective!: string;

  @IsString()
  @IsOptional()
  assignedLead?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;
}

export class ScopeMissionPromptDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @IsString()
  @IsOptional()
  mode?: 'CONVERSATION' | 'JOB_ASSIGNMENT';
}

export class InstallSuiteDto {
  @IsString()
  @IsNotEmpty()
  departmentKey!: string;

  @IsString()
  @IsOptional()
  companyId?: string;
}

export class UpdateMissionDto {
  @IsString()
  @IsOptional()
  objective?: string;

  @IsOptional()
  status?: MissionStatus;

  @IsDateString()
  @IsOptional()
  deadline?: string;
}

@ApiTags('Missions')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('missions')
export class MissionController {
  constructor(
    private readonly missionRepository: MissionRepository,
    private readonly cosService: CosService,
    private readonly moeService: MoeService,
    private readonly ceoOrchestrator: CeoOrchestratorService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('ceo/scope')
  @ApiOperation({ summary: 'Scope mission objective with CEO Asad & check department feasibility' })
  async scopeWithCeo(@Body() dto: ScopeMissionPromptDto) {
    return this.ceoOrchestrator.scopeMission(dto.companyId, dto.message, dto.mode);
  }

  @Post('ceo/stream')
  @ApiOperation({ summary: 'Real-time Server-Sent Events (SSE) streaming for CEO Asad dialogue' })
  async streamWithCeo(
    @Body() dto: ScopeMissionPromptDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const scopeResult = await this.ceoOrchestrator.scopeMission(dto.companyId, dto.message, dto.mode);
      const text = scopeResult.ceoResponse;

      const chunkSize = 20;
      for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.slice(i, i + chunkSize);
        res.write(`data: ${JSON.stringify({ text: chunk, scopeResult })}\n\n`);
        await new Promise((r) => setTimeout(r, 25));
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }

  @Post('marketplace/install')
  @ApiOperation({ summary: '1-Click installation of missing department suite into active workspace roster' })
  async installDepartmentSuite(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: InstallSuiteDto,
  ) {
    const companyId = dto.companyId || req.user.companyId;

    const listing = await this.prisma.marketplaceListing.findFirst({
      where: {
        OR: [
          { departmentKey: dto.departmentKey },
          { category: { contains: dto.departmentKey, mode: 'insensitive' } },
        ],
      },
    });

    const listingId = listing?.id;

    if (listingId) {
      await this.prisma.marketplaceInstallation.upsert({
        where: {
          companyId_listingId: {
            companyId,
            listingId,
          },
        },
        create: {
          companyId,
          listingId,
          installedBy: req.user.uid,
        },
        update: {
          installedBy: req.user.uid,
        },
      });
    }

    let department = await this.prisma.department.findFirst({
      where: {
        companyId,
        name: { contains: dto.departmentKey, mode: 'insensitive' },
      },
    });

    if (!department) {
      department = await this.prisma.department.create({
        data: {
          companyId,
          name: `${dto.departmentKey.toUpperCase()} Department`,
          description: `Specialized ${dto.departmentKey.toUpperCase()} operational department suite`,
        },
      });
    }

    let executive = await this.prisma.executive.findFirst({
      where: { departmentId: department.id },
    });

    if (executive) {
      await this.prisma.executive.update({
        where: { id: executive.id },
        data: { isActiveInWorkspace: true },
      });
    } else {
      executive = await this.prisma.executive.create({
        data: {
          name: `${dto.departmentKey.toUpperCase()} Director`,
          roleKey: `${dto.departmentKey}_director`,
          title: `Chief ${dto.departmentKey.toUpperCase()} Officer`,
          departmentId: department.id,
          isActiveInWorkspace: true,
        },
      });
    }

    return {
      success: true,
      message: `Successfully installed ${dto.departmentKey.toUpperCase()} suite into workspace roster.`,
      department,
      executive,
    };
  }

  @Post()
  @UseGuards(EntitlementGuard)
  @ApiOperation({ summary: 'Spawn a new autonomous mission task queue' })
  async create(
    @Req() req: types.AuthenticatedRequest,
    @Body() createDto: CreateMissionDto,
  ) {
    const mission = await this.missionRepository.create({
      objective: createDto.objective,
      companyId: req.user.companyId,
      status: MissionStatus.EXECUTING,
      deadline: createDto.deadline ? new Date(createDto.deadline) : undefined,
      createdBy: req.user.uid,
    });

    try {
      const wbs = await this.cosService.generateTaskDAG(createDto.objective);
      if (wbs && wbs.tasks && wbs.tasks.length > 0) {
        await this.missionRepository.createTasks(mission.id, wbs.tasks);
      }
    } catch (e) {
      // Resilient fallback if AI execution encounters throttling
    }

    return this.missionRepository.findById(mission.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all missions for user tenant organization' })
  async findAll(@Req() req: types.AuthenticatedRequest) {
    return this.missionRepository.findByCompanyId(req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific mission status and details' })
  async findOne(@Param('id') id: string) {
    const mission = await this.missionRepository.findById(id);
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }
    return mission;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update specific mission configuration details' })
  async update(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateDto: UpdateMissionDto,
  ) {
    const data: Record<string, unknown> = { ...updateDto };
    if (updateDto.deadline) {
      data.deadline = new Date(updateDto.deadline);
    }
    if (updateDto.status) {
      await this.moeService.transitionState(id, updateDto.status, req.user.uid);
      delete data.status;
    }
    if (Object.keys(data).length > 0) {
      return this.missionRepository.update(id, data);
    }
    return this.missionRepository.findById(id);
  }

  @Delete(':id')
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Cancel and soft delete a mission' })
  async remove(
    @Param('id') id: string,
    @Req() req: types.AuthenticatedRequest,
  ) {
    return this.missionRepository.softDelete(id, req.user.uid);
  }

  @Post(':id/start')
  @UseGuards(EntitlementGuard)
  @ApiOperation({ summary: 'Start executing mission objectives' })
  async start(@Req() req: types.AuthenticatedRequest, @Param('id') id: string) {
    const mission = (await this.missionRepository.findById(id)) as any;
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    await this.moeService.transitionState(id, MissionStatus.EXECUTING, req.user.uid);

    if (!mission.tasks || mission.tasks.length === 0) {
      try {
        const wbs = await this.cosService.generateTaskDAG(mission.objective);
        if (wbs && wbs.tasks && wbs.tasks.length > 0) {
          await this.missionRepository.createTasks(id, wbs.tasks);
        }
      } catch (e) {
        // Resilient fallback
      }
    }

    return this.missionRepository.findById(id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause running mission' })
  async pause(@Req() req: types.AuthenticatedRequest, @Param('id') id: string) {
    await this.moeService.transitionState(id, MissionStatus.PLANNING, req.user.uid);
    return this.missionRepository.findById(id);
  }

  @Post(':id/resume')
  @UseGuards(EntitlementGuard)
  @ApiOperation({ summary: 'Resume paused mission' })
  async resume(@Req() req: types.AuthenticatedRequest, @Param('id') id: string) {
    await this.moeService.transitionState(id, MissionStatus.EXECUTING, req.user.uid);
    return this.missionRepository.findById(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel current mission run' })
  async cancel(@Req() req: types.AuthenticatedRequest, @Param('id') id: string) {
    await this.moeService.transitionState(id, MissionStatus.ARCHIVED, req.user.uid);
    return this.missionRepository.findById(id);
  }

  @Post(':id/plan')
  @ApiOperation({
    summary: 'Generate Task WBS DAG plan using AI Chief of Staff',
  })
  async plan(@Param('id') id: string) {
    const mission = await this.missionRepository.findById(id);
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }
    return this.cosService.generateTaskDAG(mission.objective);
  }

  @Get(':id/health')
  @ApiOperation({
    summary: 'Calculate real-time mission execution health metrics',
  })
  async getHealth(@Param('id') id: string) {
    return this.moeService.calculateHealthScore(id);
  }
}
