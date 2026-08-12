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
  @Roles(UserRole.SUPER_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all multi-tenant organizations for Super Admin' })
  async findAll() {
    return this.companyRepository.findAll();
  }

  @Get('check-slug')
  @ApiOperation({ summary: 'Check if company URL slug is available' })
  async checkSlug(@Query('slug') slug: string) {
    return this.companyService.checkSlugAvailability(slug || '');
  }

  @Post('onboard')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete first-time company onboarding and provision workspace' })
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

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get organization details by ID' })
  async findOne(@Param('id') id: string) {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundException('Organization not found');
    }
    return company;
  }
}
