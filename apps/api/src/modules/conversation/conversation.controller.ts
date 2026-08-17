import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConversationService } from './conversation.service';
import { AuthGuard } from '../auth/auth.guard';
import { EntitlementGuard } from '../auth/entitlement.guard';
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

  @IsString()
  @IsOptional()
  senderType?: string;
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

    const companyId = req.user?.companyId || req.user?.uid || '';
    return this.conversationService.getConversations(companyId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed context for a boardroom discussion' })
  async findOne(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const companyId = req.user?.companyId || req.user?.uid;
    const conv = await this.conversationService.getConversation(id, companyId);
    return conv;
  }

  @Post()
  @ApiOperation({ summary: 'Start a new boardroom discussion session' })
  async create(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: StartDiscussionDto,
  ) {
    const keys = dto.specialistKeys || dto.specialists || [];
    const userId = req.user?.uid || '';
    const companyId = req.user?.companyId || req.user?.uid || '';
    return this.conversationService.startDiscussion(
      userId,
      companyId,
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
    const companyId = req.user?.companyId || req.user?.uid;
    await this.conversationService.getConversation(id, companyId);

    const userId = req.user.uid;
    // Strictly enforce client messages as USER to prevent origin spoofing/executive impersonation
    const senderType = 'USER';
    return this.conversationService.submitMessage(
      id,
      userId,
      senderType,
      dto.content,
    );
  }

  @Post(':id/messages/direct')
  @ApiOperation({
    summary: 'Append direct message to discussion thread in database',
  })
  async appendDirectMessage(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    const companyId = req.user?.companyId || req.user?.uid;
    await this.conversationService.getConversation(id, companyId);

    const userId = req.user.uid;
    // Strictly enforce client messages as USER to prevent origin spoofing/executive impersonation
    const senderType = 'USER';
    return this.conversationService.saveMessage(
      id,
      userId,
      senderType,
      dto.content,
    );
  }

  @Post(':id/convert-mission')
  @UseGuards(EntitlementGuard)
  @ApiOperation({
    summary: 'Convert discussion outcome into actionable mission',
  })
  async convertToMission(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const companyId = req.user?.companyId || req.user?.uid;
    await this.conversationService.getConversation(id, companyId);

    const userId = req.user?.uid || '';
    return this.conversationService.convertToMission(id, userId);
  }
}
