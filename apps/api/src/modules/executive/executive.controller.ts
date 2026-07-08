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
import { AuthGuard } from '../auth/auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

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

@ApiTags('Executives')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('executives')
export class ExecutiveController {
  constructor(
    private readonly executiveRepository: ExecutiveRepository,
    private readonly ceoService: CeoService,
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
    // Stub AI agent handler response
    return {
      executiveId: id,
      response: `Hello! I am ${exec.name}, your ${exec.title}. I received your message: "${chatDto.message}". The intelligence handler is booting up.`,
    };
  }
}
