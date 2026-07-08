import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { ExecutePromptDto } from './dto/execute-prompt.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  async executePrompt(@Body() dto: ExecutePromptDto) {
    return this.aiService.executePrompt(dto);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateCopy(@Body() dto: ExecutePromptDto) {
    return this.aiService.executePrompt(dto);
  }

  @Get('status')
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
