import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class ExecutePromptDto {
  @IsString()
  prompt: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsString()
  @IsOptional()
  provider?: string;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  maxTokens?: number;

  @IsBoolean()
  @IsOptional()
  simulateFailure?: boolean;

  @IsBoolean()
  @IsOptional()
  jsonMode?: boolean;

  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  category?:
    | 'MISSION'
    | 'RESEARCH'
    | 'CONVERSATION'
    | 'STORAGE'
    | 'ORCHESTRATION'
    | 'EVALUATION';
}

