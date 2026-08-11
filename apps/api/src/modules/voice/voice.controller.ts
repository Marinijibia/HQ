import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { VoiceService } from './voice.service';
import { AuthGuard } from '../auth/auth.guard';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SynthesizeSpeechDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsString()
  @IsOptional()
  persona?: string;

  @IsString()
  @IsOptional()
  provider?: 'elevenlabs' | 'openai' | 'huggingface' | 'auto';
}

@ApiTags('AI Voice Assistant')
@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Get('personas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List available executive AI voice personas' })
  async getPersonas() {
    return this.voiceService.getAvailablePersonas();
  }

  @Post('synthesize')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Synthesize executive AI voice audio for text using ElevenLabs or OpenAI SDK' })
  async synthesize(@Body() dto: SynthesizeSpeechDto) {
    return this.voiceService.synthesizeSpeech(
      dto.text,
      dto.persona || 'asad',
      dto.provider || 'auto',
    );
  }

  @Post('transcribe')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transcribe audio buffer to text using OpenAI Whisper SDK' })
  async transcribe(@UploadedFile() file: any) {
    if (!file || !file.buffer) {
      return { text: '', error: 'No audio file provided' };
    }
    const text = await this.voiceService.transcribeAudio(file.buffer, file.originalname || 'speech.webm');
    return { text: text || '' };
  }
}
