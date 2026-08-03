import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConversationService } from './conversation.service';
import { AuthGuard } from '../auth/auth.guard';
import * as types from '../../common/interfaces/request.interface';
import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class StartDiscussionDto {
  @IsString()
  @IsNotEmpty()
  objective!: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  specialists?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  specialistKeys?: string[];
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all boardroom discussions for tenant company' })
  async findAll(
    @Req() req: types.AuthenticatedRequest,
    @Query('isPinned') isPinned?: string,
    @Query('isArchived') isArchived?: string,
    @Query('search') search?: string,
  ) {
    const filters: {
      isPinned?: boolean;
      isArchived?: boolean;
      search?: string;
    } = {};
    if (isPinned !== undefined) filters.isPinned = isPinned === 'true';
    if (isArchived !== undefined) filters.isArchived = isArchived === 'true';
    if (search !== undefined) filters.search = search;

    return this.conversationService.getConversations(
      req.user.companyId,
      filters,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed context for a boardroom discussion' })
  async findOne(@Param('id') id: string) {
    return this.conversationService.getConversation(id);
  }

  @Post()
  @ApiOperation({ summary: 'Start a new boardroom discussion session' })
  async create(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: StartDiscussionDto,
  ) {
    const keys = dto.specialistKeys || dto.specialists || [];
    return this.conversationService.startDiscussion(
      req.user.uid,
      req.user.companyId,
      dto.objective,
      keys,
    );
  }

  @Post(':id/messages')
  @ApiOperation({
    summary: 'Send message to discussion and trigger deliberations',
  })
  async sendMessage(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.conversationService.submitMessage(
      id,
      req.user.uid,
      'USER',
      dto.content,
    );
  }

  @Post(':id/convert-mission')
  @ApiOperation({
    summary: 'Convert discussion outcome into actionable mission',
  })
  async convertToMission(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.conversationService.convertToMission(id, req.user.uid);
  }
}
