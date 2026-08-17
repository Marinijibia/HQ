import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CopywriterService } from './copywriter.service';
import { DesignerService } from './designer.service';
import { ExecutePromptDto } from './dto/execute-prompt.dto';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import * as types from '../../common/interfaces/request.interface';

export class GenerateCopyDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @IsString()
  @IsOptional()
  tone?: string;

  @IsOptional()
  lengthLimit?: number;
}

export class GenerateImageDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @IsString()
  @IsOptional()
  size?: string;
}

@ApiTags('AI Engine')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly copywriterService: CopywriterService,
    private readonly designerService: DesignerService,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute multi-model prompt with auto-failover' })
  async executePrompt(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: ExecutePromptDto,
  ) {
    if (req.user?.companyId) {
      dto.companyId = req.user.companyId;
    }
    return this.aiService.executePrompt(dto);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate completion draft via AI provider chain' })
  async generateCopy(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: ExecutePromptDto,
  ) {
    if (req.user?.companyId) {
      dto.companyId = req.user.companyId;
    }
    return this.aiService.executePrompt(dto);
  }

  @Post('copywriter/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate professional marketing copy' })
  async generateCopywriting(@Body() dto: GenerateCopyDto) {
    return this.copywriterService.generateCopywritingDraft(
      dto.prompt,
      dto.tone,
      dto.lengthLimit,
    );
  }

  @Post('designer/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate UI / marketing asset concept' })
  async generateImage(@Body() dto: GenerateImageDto) {
    return this.designerService.generateImage(dto.prompt, dto.size);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get active AI provider statuses' })
  async getGatewayStatus() {
    return {
      status: 'Active',
      providers: [
        { name: 'gemini', status: 'Active', latencyMs: 145 },
        { name: 'openai', status: 'Active', latencyMs: 280 },
        { name: 'anthropic', status: 'Active', latencyMs: 310 },
      ],
      defaultProvider: 'gemini',
      failoverFallbackOrder: ['gemini', 'openai', 'anthropic'],
    };
  }
}
