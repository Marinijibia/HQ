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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateExecutiveCmsDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsString()
  @IsOptional()
  biography?: string;
}

export class TrainExecutiveCmsDto {
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class CreateDepartmentCmsDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

@ApiTags('Admin CMS')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('executives')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({
    summary: 'List all executives with training documents for Admin CMS',
  })
  async getExecutives(@Req() req: any) {
    const companyId = req.user?.companyId;
    return this.cmsService.getExecutives(companyId);
  }

  @Get('departments')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({
    summary: 'List all departments with active executives for Admin CMS',
  })
  async getDepartments(@Req() req: any) {
    const companyId = req.user?.companyId;
    return this.cmsService.getDepartments(companyId);
  }

  @Patch('executives/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({
    summary: 'Update executive persona, title, or system prompt',
  })
  async updateExecutive(
    @Param('id') id: string,
    @Body() dto: UpdateExecutiveCmsDto,
    @Req() req: any,
  ) {
    return this.cmsService.updateExecutive(id, dto, req.user?.companyId);
  }

  @Post('executives/:id/train')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({
    summary:
      'Train and ingest knowledge document into pgvector for an AI Executive',
  })
  async trainExecutive(
    @Param('id') id: string,
    @Body() dto: TrainExecutiveCmsDto,
    @Req() req: any,
  ) {
    return this.cmsService.trainExecutive(id, dto, req.user);
  }

  @Delete('executives/training/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Delete training document embedding from pgvector' })
  async deleteTrainingDoc(@Param('id') id: string, @Req() req: any) {
    return this.cmsService.deleteTrainingDoc(id, req.user?.companyId);
  }

  @Delete('training/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Alias to delete training document embedding' })
  async deleteTrainingDocAlias(@Param('id') id: string, @Req() req: any) {
    return this.cmsService.deleteTrainingDoc(id, req.user?.companyId);
  }

  @Post('departments')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Create a new operational department in Admin CMS' })
  async createDepartment(@Body() dto: CreateDepartmentCmsDto, @Req() req: any) {
    return this.cmsService.createDepartment(dto, req.user);
  }
}
