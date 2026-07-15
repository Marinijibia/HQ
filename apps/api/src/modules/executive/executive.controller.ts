import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExecutiveRepository } from './executive.repository';
import { CeoService } from './ceo.service';
import { QaService } from './qa.service';
import { AiService } from '../ai/ai.service';
import { AuthGuard } from '../auth/auth.guard';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ChatExecutiveDto {
  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class AnalyzeObjectiveDto {
  @IsString()
  @IsNotEmpty()
  objective!: string;
}

export class EvaluateDeliverableDto {
  @IsString()
  @IsNotEmpty()
  objective!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  tone?: string;
}

@ApiTags('Executives')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('executives')
export class ExecutiveController {
  constructor(
    private readonly executiveRepository: ExecutiveRepository,
    private readonly ceoService: CeoService,
    private readonly qaService: QaService,
    private readonly aiService: AiService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active C-Suite AI executives' })
  async findAll() {
    return this.executiveRepository.findAll();
  }

  @Get('ceo/welcome')
  @ApiOperation({ summary: 'Get welcome greeting context from AI CEO' })
  async getWelcome() {
    return this.ceoService.getWelcomeContext();
  }

  @Post('ceo/analyze')
  @ApiOperation({
    summary: 'Spawn CEO strategic reasoning and workgroup allocations',
  })
  async analyze(@Body() dto: AnalyzeObjectiveDto) {
    return this.ceoService.compileStrategicSummary(dto.objective);
  }

  @Post('qa/evaluate')
  @ApiOperation({ summary: 'Spawn QA validation gate pre-flight testing' })
  async evaluate(@Body() dto: EvaluateDeliverableDto) {
    return this.qaService.evaluateDeliverable(
      dto.objective,
      dto.content,
      dto.tone,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific AI executive configuration' })
  async findOne(@Param('id') id: string) {
    const exec = await this.executiveRepository.findById(id);
    if (!exec) {
      throw new NotFoundException('Executive not found');
    }
    return exec;
  }

  @Post(':id/chat')
  @ApiOperation({
    summary: 'Trigger chat response handler with specific executive',
  })
  async chat(@Param('id') id: string, @Body() chatDto: ChatExecutiveDto) {
    const exec = await this.executiveRepository.findById(id);
    if (!exec) {
      throw new NotFoundException('Executive not found');
    }

    const systemPrompt = `
      You are ${exec.name}, the ${exec.title} at HQ Corporation.
      Department: ${exec.department?.name || 'Executive Office'}
      Biography/Context: ${exec.biography || ''}
      Role Guidelines: ${exec.systemPrompt || ''}

      Respond to the user's message as this persona. Keep the tone professional, authoritative, in-character, and aligned with your role.
    `;

    try {
      const result = await this.aiService.executePrompt({
        prompt: chatDto.message,
        systemPrompt,
        provider: 'gemini',
      });
      return {
        executiveId: id,
        response: result.text,
      };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      return {
        executiveId: id,
        response: `Hello. I am ${exec.name}, your ${exec.title}. I encountered an operational error deliberating your request: ${errorMsg}`,
      };
    }
  }
}
