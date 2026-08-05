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
    return this.prisma.executive.findMany({
      include: {
        department: true,
        trainingData: true,
      },
      orderBy: { createdAt: 'asc' },
    });
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
