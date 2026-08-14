import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExecutiveRepository } from './executive.repository';
import { CeoService } from './ceo.service';
import { QaService } from './qa.service';
import { ResourceService } from './resource.service';
import { FinanceService } from './finance.service';
import { AiService } from '../ai/ai.service';
import { AuthGuard } from '../auth/auth.guard';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

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

export class ToggleExecutiveStatusDto {
  @IsBoolean()
  isActive!: boolean;
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
    private readonly resourceService: ResourceService,
    private readonly financeService: FinanceService,
    private readonly aiService: AiService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active C-Suite AI executives (scoped to org)' })
  async findAll(@Req() req: any) {
    return this.executiveRepository.findAll(req.user?.companyId);
  }

  @Get('roster/capacity')
  @ApiOperation({ summary: 'Audit workspace executive roster capacity & domain coverage' })
  async getRosterCapacity(@Req() req: any) {
    return this.resourceService.auditRosterCapacity(req.user?.companyId);
  }

  @Get('finance/health')
  @ApiOperation({ summary: 'Run CFO financial health audit and runway calculations' })
  async getFinancialHealth(@Req() req: any) {
    return this.financeService.auditFinancialHealth(req.user?.companyId);
  }

  @Get('finance/forecast')
  @ApiOperation({ summary: 'Generate CFO financial runway projection forecast' })
  async getFinancialForecast(@Req() req: any) {
    return this.financeService.forecastRunway(req.user?.companyId);
  }

  @Get('finance/unit-economics')
  @ApiOperation({ summary: 'Calculate CFO Unit Economics — provide cac, arpu, churnRate, grossMargin via query' })
  async getUnitEconomics(@Query() query: any) {
    const cac = parseFloat(query.cac);
    const arpu = parseFloat(query.arpu);
    const churnRate = parseFloat(query.churnRate);
    const grossMargin = parseFloat(query.grossMargin);

    if ([cac, arpu, churnRate, grossMargin].some(isNaN)) {
      return {
        error: 'REQUIRES_INPUT',
        message: 'Provide query params: cac, arpu, churnRate, grossMargin to calculate unit economics.',
      };
    }

    return this.financeService.calculateUnitEconomics(cac, arpu, churnRate, grossMargin);
  }

  @Get('finance/cap-table')
  @ApiOperation({ summary: 'Simulate Cap Table dilution — provide preMoney, investment, optionPool via query' })
  async getCapTableScenario(@Query() query: any) {
    const preMoney = parseFloat(query.preMoney);
    const investment = parseFloat(query.investment);
    const optionPool = parseFloat(query.optionPool ?? '10');

    if ([preMoney, investment].some(isNaN)) {
      return {
        error: 'REQUIRES_INPUT',
        message: 'Provide query params: preMoney, investment, and optionally optionPool.',
      };
    }

    return this.financeService.simulateCapTableDilution(preMoney, investment, optionPool);
  }

  @Get('ceo/welcome')
  @ApiOperation({ summary: 'Get welcome greeting context from AI CEO' })
  async getWelcome(@Req() req: any) {
    return this.ceoService.getWelcomeContext(req.user?.companyId);
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

  @Post(':id/activate')
  @ApiOperation({ summary: 'Toggle AI executive active status in workspace' })
  async toggleActivation(@Param('id') id: string, @Body() dto: ToggleExecutiveStatusDto) {
    return this.resourceService.activateExecutive(id, dto.isActive);
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
