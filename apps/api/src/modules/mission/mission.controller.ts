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
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MissionRepository } from './mission.repository';
import { CosService } from './cos.service';
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

export class CreateMissionDto {
  @IsString()
  @IsNotEmpty()
  objective!: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;
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
  ) {}

  @Post()
  @UseGuards(EntitlementGuard)
  @ApiOperation({ summary: 'Spawn a new autonomous mission task queue' })
  async create(
    @Req() req: types.AuthenticatedRequest,
    @Body() createDto: CreateMissionDto,
  ) {
    return this.missionRepository.create({
      objective: createDto.objective,
      companyId: req.user.companyId,
      deadline: createDto.deadline ? new Date(createDto.deadline) : undefined,
      createdBy: req.user.uid,
    });
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
  async update(@Param('id') id: string, @Body() updateDto: UpdateMissionDto) {
    const data: Record<string, unknown> = { ...updateDto };
    if (updateDto.deadline) {
      data.deadline = new Date(updateDto.deadline);
    }
    return this.missionRepository.update(id, data);
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
  async start(@Param('id') id: string) {
    return this.missionRepository.update(id, {
      status: MissionStatus.EXECUTING,
    });
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause running mission' })
  async pause(@Param('id') id: string) {
    return this.missionRepository.update(id, {
      status: MissionStatus.PLANNING,
    });
  }

  @Post(':id/resume')
  @UseGuards(EntitlementGuard)
  @ApiOperation({ summary: 'Resume paused mission' })
  async resume(@Param('id') id: string) {
    return this.missionRepository.update(id, {
      status: MissionStatus.EXECUTING,
    });
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel current mission run' })
  async cancel(@Param('id') id: string) {
    return this.missionRepository.update(id, {
      status: MissionStatus.ARCHIVED,
    });
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
}
