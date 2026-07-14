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
} from '@nestjs/common';
import { MemoryService } from './memory.service';
import { MemoryLayer } from '@prisma/client';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';

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

@Controller('memory')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Get()
  async list() {
    const companyId = '7b18dfa8-7fba-4b77-8fa8-fb18dfa87fba';
    return this.memoryService.listMemories(companyId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async save(@Body() dto: SaveMemoryDto) {
    const companyId = '7b18dfa8-7fba-4b77-8fa8-fb18dfa87fba';
    return this.memoryService.saveMemory({
      companyId,
      layer: dto.layer,
      key: dto.key,
      value: dto.value,
      executiveId: dto.executiveId,
      missionId: dto.missionId,
    });
  }

  @Post('query')
  @HttpCode(HttpStatus.OK)
  async query(@Body() dto: QueryMemoryDto) {
    const companyId = '7b18dfa8-7fba-4b77-8fa8-fb18dfa87fba';
    return this.memoryService.retrieveContext(companyId, dto.query, {
      executiveId: dto.executiveId,
      missionId: dto.missionId,
    });
  }

  @Post('review-cycle')
  @HttpCode(HttpStatus.OK)
  async reviewCycle() {
    const companyId = '7b18dfa8-7fba-4b77-8fa8-fb18dfa87fba';
    return this.memoryService.runReviewCycle(companyId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateMemoryDto) {
    await this.memoryService.updateMemory(id, dto);
    return { success: true };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    await this.memoryService.deleteMemory(id);
    return { success: true };
  }

  @Post(':id/promote')
  @HttpCode(HttpStatus.OK)
  async promote(
    @Param('id') id: string,
    @Body('targetLayer') targetLayer: MemoryLayer,
  ) {
    await this.memoryService.promoteMemory(id, targetLayer);
    return { success: true };
  }
}
