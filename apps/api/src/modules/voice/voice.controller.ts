import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { VoiceService } from './voice.service';
import { AuthGuard } from '../auth/auth.guard';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import * as types from '../../common/interfaces/request.interface';

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
  @ApiOperation({
    summary:
      'Synthesize executive AI voice audio for text using ElevenLabs or OpenAI SDK',
  })
  async synthesize(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: SynthesizeSpeechDto,
  ) {
    return this.voiceService.synthesizeSpeech(
      dto.text,
      dto.persona || 'asad',
      dto.provider || 'auto',
      req.user?.companyId,
    );
  }

  @Post('transcribe')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB Whisper audio buffer limit
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Transcribe audio buffer to text using OpenAI Whisper SDK',
  })
  async transcribe(
    @Req() req: types.AuthenticatedRequest,
    @UploadedFile() file: any,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No audio file provided');
    }

    const allowedMimeTypes = [
      'audio/webm',
      'audio/wav',
      'audio/x-wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/m4a',
      'audio/x-m4a',
      'audio/flac',
      'video/webm',
    ];

    if (file.mimetype && !allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      throw new BadRequestException(`Invalid audio format "${file.mimetype}". Expected valid audio payload.`);
    }

    if (file.buffer.length > 25 * 1024 * 1024) {
      throw new BadRequestException('Audio file exceeds maximum size limit of 25MB.');
    }

    const text = await this.voiceService.transcribeAudio(
      file.buffer,
      file.originalname || 'speech.webm',
      req.user?.companyId,
    );
    return { text: text || '' };
  }
}
