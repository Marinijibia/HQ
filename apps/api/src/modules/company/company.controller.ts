import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CompanyRepository } from './company.repository';
import { CompanyService } from './company.service';
import { OnboardCompanyDto } from './dto/onboard-company.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { CompanyLevel } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import * as types from '../../common/interfaces/request.interface';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsEnum(CompanyLevel)
  @IsOptional()
  level?: CompanyLevel;

  @IsString()
  @IsOptional()
  parentId?: string;
}

@ApiTags('Organizations')
@Controller('organizations')
export class CompanyController {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly companyService: CompanyService,
  ) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMINISTRATOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all multi-tenant organizations for Super Admin with metrics',
  })
  async findAll() {
    return this.companyRepository.findAllWithMetrics();
  }

  @Get('check-slug')
  @ApiOperation({ summary: 'Check if company URL slug is available' })
  async checkSlug(@Req() req: types.AuthenticatedRequest, @Query('slug') slug: string) {
    return this.companyService.checkSlugAvailability(slug || '', req.ip);
  }

  @Post('onboard')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Complete first-time company onboarding and provision workspace',
  })
  async onboard(
    @CurrentUser() currentUser: { uid: string },
    @Body() dto: OnboardCompanyDto,
  ) {
    return this.companyService.onboardCompany(currentUser.uid, dto);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMINISTRATOR, UserRole.ORGANIZATION_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new multi-tenant organization' })
  async create(@Body() createDto: CreateCompanyDto) {
    return this.companyRepository.create(createDto);
  }

  @Get(':id/details')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get detailed organization metrics, users, and marketplace installations',
  })
  async getDetails(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    if (
      req.user?.role !== UserRole.SUPER_ADMINISTRATOR &&
      req.user?.companyId !== id
    ) {
      throw new ForbiddenException(
        'Access denied: You do not have permission to view this organization details',
      );
    }
    const details = await this.companyRepository.findDetailsWithMetrics(id);
    if (!details) {
      throw new NotFoundException('Organization not found');
    }
    return details;
  }

  @Patch(':id/level')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMINISTRATOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update organization level / tier (ENTERPRISE, TEAM, INDIVIDUAL)',
  })
  async updateLevel(
    @Param('id') id: string,
    @Body('level') level: CompanyLevel,
  ) {
    return this.companyRepository.update(id, { level });
  }

  @Post(':id/force-password-reset')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMINISTRATOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Force password reset requirement for all tenant users',
  })
  async forcePasswordReset(@Param('id') id: string) {
    return this.companyRepository.forcePasswordResetForOrg(id);
  }

  @Post(':id/suspend')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMINISTRATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle organization workspace suspension state' })
  async toggleSuspend(
    @Param('id') id: string,
    @Body('isSuspended') isSuspended: boolean,
  ) {
    return this.companyRepository.toggleSuspension(id, isSuspended);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get organization details by ID' })
  async findOne(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    if (
      req.user?.role !== UserRole.SUPER_ADMINISTRATOR &&
      req.user?.companyId !== id
    ) {
      throw new ForbiddenException('Access denied: You do not have permission to view this organization');
    }

    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundException('Organization not found');
    }
    return company;
  }
}
