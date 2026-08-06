import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AssetService } from './asset.service';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../database/prisma.service';
import * as types from '../../common/interfaces/request.interface';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { DataClassification } from '@prisma/client';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  fileSize!: number;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsString()
  @IsNotEmpty()
  sha256!: string;

  @IsString()
  @IsNotEmpty()
  gcsPath!: string;

  @IsEnum(DataClassification)
  @IsOptional()
  classification?: DataClassification;

  @IsString()
  @IsOptional()
  missionId?: string;
}

export class CreateVersionDto {
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsInt()
  fileSize!: number;

  @IsString()
  @IsNotEmpty()
  sha256!: string;

  @IsString()
  @IsNotEmpty()
  gcsPath!: string;

  @IsString()
  @IsOptional()
  changeSummary?: string;
}

export class RollbackDto {
  @IsString()
  @IsNotEmpty()
  versionId!: string;
}

@ApiTags('Assets')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('assets')
export class AssetController {
  constructor(
    private readonly assetService: AssetService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all organization assets' })
  async findAll(
    @Req() req: types.AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('classification') classification?: DataClassification,
    @Query('category') category?: string,
    @Query('missionId') missionId?: string,
  ) {
    const assets = await this.assetService.getAssets(req.user.companyId, {
      search,
      classification,
      category,
      missionId,
    });

    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId: req.user.companyId },
      include: { plan: true },
    });
    const planCode = subscription?.plan?.code?.toLowerCase() || 'free';

    return {
      assets,
      planCode,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details and version ledger for an asset' })
  async findOne(@Param('id') id: string) {
    return this.assetService.getAsset(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register an uploaded asset metadata entry' })
  async create(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: CreateAssetDto,
  ) {
    return this.assetService.createAsset({
      ...dto,
      companyId: req.user.companyId,
    });
  }

  @Post(':id/versions')
  @ApiOperation({ summary: 'Create a new version for an asset' })
  async createVersion(@Param('id') id: string, @Body() dto: CreateVersionDto) {
    return this.assetService.addVersion(id, dto);
  }

  @Post(':id/rollback')
  @ApiOperation({ summary: 'Rollback to a specific historical asset version' })
  async rollback(@Param('id') id: string, @Body() dto: RollbackDto) {
    return this.assetService.rollback(id, dto.versionId);
  }

  @Post(':id/toggle-hold')
  @ApiOperation({ summary: 'Toggle regulatory compliance Legal Hold lock' })
  async toggleHold(@Param('id') id: string) {
    return this.assetService.toggleLegalHold(id);
  }

  @Post(':id/ai-summary')
  @ApiOperation({ summary: 'Generate instant AI document executive summary with Mr. Intelligence' })
  async summarizeWithAI(@Param('id') id: string) {
    return this.assetService.summarizeAssetWithAI(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete/archive an asset entry' })
  async remove(@Param('id') id: string) {
    return this.assetService.deleteAsset(id);
  }
}
