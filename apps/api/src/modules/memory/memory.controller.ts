import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MemoryService } from './memory.service';
import { MemoryLayer } from '@prisma/client';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import * as types from '../../common/interfaces/request.interface';

export class SaveMemoryDto {
  @IsEnum(MemoryLayer)
  layer!: MemoryLayer;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsOptional()
  executiveId?: string;

  @IsString()
  @IsOptional()
  missionId?: string;
}

export class UpdateMemoryDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsNumber()
  @IsOptional()
  confidence?: number;

  @IsOptional()
  tags?: string[];
}

export class QueryMemoryDto {
  @IsString()
  @IsNotEmpty()
  query!: string;

  @IsString()
  @IsOptional()
  executiveId?: string;

  @IsString()
  @IsOptional()
  missionId?: string;
}

@ApiTags('Memory')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('memory')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Get()
  @ApiOperation({ summary: 'List all organization memory nodes' })
  async list(@Req() req: types.AuthenticatedRequest) {
    return this.memoryService.listMemories(req.user.companyId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save a new memory node' })
  async save(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: SaveMemoryDto,
  ) {
    return this.memoryService.saveMemory({
      companyId: req.user.companyId,
      layer: dto.layer,
      key: dto.key,
      value: dto.value,
      executiveId: dto.executiveId,
      missionId: dto.missionId,
    });
  }

  @Post('query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Query semantic memories for context retrieval' })
  async query(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: QueryMemoryDto,
  ) {
    return this.memoryService.retrieveContext(req.user.companyId, dto.query, {
      executiveId: dto.executiveId,
      missionId: dto.missionId,
    });
  }

  @Post('review-cycle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger a Memory Review Cycle optimization run' })
  async reviewCycle(@Req() req: types.AuthenticatedRequest) {
    return this.memoryService.runReviewCycle(req.user.companyId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a specific memory node content/metadata' })
  async update(@Param('id') id: string, @Body() dto: UpdateMemoryDto) {
    await this.memoryService.updateMemory(id, dto);
    return { success: true };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive/delete a memory node' })
  async delete(@Param('id') id: string) {
    await this.memoryService.deleteMemory(id);
    return { success: true };
  }

  @Post(':id/promote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Promote a working memory to another layer' })
  async promote(
    @Param('id') id: string,
    @Body('targetLayer') targetLayer: MemoryLayer,
  ) {
    await this.memoryService.promoteMemory(id, targetLayer);
    return { success: true };
  }
}
