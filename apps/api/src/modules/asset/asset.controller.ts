import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AssetService } from './asset.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
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

  @Get(':id/content')
  @ApiOperation({ summary: 'Get full document text content for preview' })
  async getContent(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.assetService.getAssetContent(id, req.user.companyId);
  }

  @Get(':id/raw')
  @ApiOperation({ summary: 'Stream asset binary file inline for browser preview' })
  async streamRaw(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
    @Res() res: any,
  ) {
    const { asset, buffer } = await this.assetService.getAssetFile(id, req.user.companyId);
    res.setHeader('Content-Type', asset.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(asset.filename)}"`,
    );
    res.setHeader('Content-Length', buffer.length);
    return res.end(buffer);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download asset binary file' })
  async download(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
    @Res() res: any,
  ) {
    const { asset, buffer } = await this.assetService.getAssetFile(id, req.user.companyId);
    res.setHeader('Content-Type', asset.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(asset.filename)}"`,
    );
    res.setHeader('Content-Length', buffer.length);
    return res.end(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details and version ledger for an asset' })
  async findOne(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.assetService.getAsset(id, req.user.companyId);
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
  async createVersion(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: CreateVersionDto,
  ) {
    return this.assetService.addVersion(id, req.user.companyId, dto);
  }

  @Post(':id/rollback')
  @ApiOperation({ summary: 'Rollback to a specific historical asset version' })
  async rollback(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: RollbackDto,
  ) {
    return this.assetService.rollback(id, req.user.companyId, dto.versionId);
  }

  @Post(':id/toggle-hold')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Toggle regulatory compliance Legal Hold lock' })
  async toggleHold(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.assetService.toggleLegalHold(id, req.user.companyId);
  }

  @Post(':id/ai-summary')
  @ApiOperation({
    summary:
      'Generate instant AI document executive summary with Mr. Intelligence',
  })
  async summarizeWithAI(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.assetService.summarizeAssetWithAI(id, req.user.companyId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Soft delete/archive an asset entry' })
  async remove(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.assetService.deleteAsset(id, req.user.companyId);
  }
}
