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
import { CompanyRepository } from './company.repository';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { CompanyLevel } from '@prisma/client';
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

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;
}

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('organizations')
export class CompanyController {
  constructor(private readonly companyRepository: CompanyRepository) {}

  @Post()
  @Roles(UserRole.SUPER_ADMINISTRATOR, UserRole.ORGANIZATION_OWNER)
  @ApiOperation({ summary: 'Create a new multi-tenant organization' })
  async create(@Body() createDto: CreateCompanyDto) {
    return this.companyRepository.create(createDto);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current logged-in user organization details' })
  async findCurrent(@Req() req: types.AuthenticatedRequest) {
    const companyId = req.user.companyId;
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException('Current organization not found');
    }
    return company;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization details by ID' })
  async findOne(@Param('id') id: string) {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundException('Organization not found');
    }
    return company;
  }

  @Patch(':id')
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Update organization attributes' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateCompanyDto) {
    return this.companyRepository.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMINISTRATOR, UserRole.ORGANIZATION_OWNER)
  @ApiOperation({ summary: 'Soft delete an organization' })
  async remove(
    @Param('id') id: string,
    @Req() req: types.AuthenticatedRequest,
  ) {
    return this.companyRepository.softDelete(id, req.user.uid);
  }
}
