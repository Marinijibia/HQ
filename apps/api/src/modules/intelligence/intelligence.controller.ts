import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IntelligenceService } from './intelligence.service';
import { AuthGuard } from '../auth/auth.guard';
import * as types from '../../common/interfaces/request.interface';

@ApiTags('Intelligence')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('intelligence')
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Get()
  @ApiOperation({ summary: 'Get the full Digital Organization Model' })
  getIntelligence(@Req() req: types.AuthenticatedRequest) {
    return this.intelligenceService.getIntelligence(req.user.companyId);
  }

  @Patch('domain/:domain')
  @ApiOperation({ summary: 'Update a specific intelligence domain' })
  updateDomain(
    @Req() req: types.AuthenticatedRequest,
    @Param('domain') domain: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.intelligenceService.updateDomain(
      req.user.companyId,
      domain as Parameters<IntelligenceService['updateDomain']>[1],
      data,
    );
  }

  @Post('domain/:domain/draft')
  @ApiOperation({ summary: 'Draft data for a specific domain using AI' })
  draftDomain(
    @Req() req: types.AuthenticatedRequest,
    @Param('domain') domain: string,
  ) {
    return this.intelligenceService.generateDraft(
      req.user.companyId,
      domain as Parameters<IntelligenceService['generateDraft']>[1],
    );
  }

  @Post('suggestions/:id/approve')
  @ApiOperation({ summary: 'Approve a pending learning suggestion' })
  approveSuggestion(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.intelligenceService.approveSuggestion(req.user.companyId, id);
  }

  @Post('suggestions/:id/dismiss')
  @ApiOperation({ summary: 'Dismiss a pending learning suggestion' })
  dismissSuggestion(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.intelligenceService.dismissSuggestion(req.user.companyId, id);
  }

  @Post('learn')
  @ApiOperation({ summary: 'Add a learning insight to organizational memory' })
  addLearning(
    @Req() req: types.AuthenticatedRequest,
    @Body() body: { source: string; insight: string; domain: string },
  ) {
    return this.intelligenceService.addLearningInsight(
      req.user.companyId,
      body.source,
      body.insight,
      body.domain as Parameters<IntelligenceService['addLearningInsight']>[3],
    );
  }

  @Get('health')
  @ApiOperation({ summary: 'Get the Organization Health Score' })
  getHealthScore(@Req() req: types.AuthenticatedRequest) {
    return this.intelligenceService.getHealthScore(req.user.companyId);
  }

  @Patch('health/:dimension')
  @ApiOperation({ summary: 'Update a health score dimension' })
  updateHealthScore(
    @Req() req: types.AuthenticatedRequest,
    @Param('dimension') dimension: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.intelligenceService.updateHealthScore(
      req.user.companyId,
      dimension as Parameters<IntelligenceService['updateHealthScore']>[1],
      data,
    );
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get the Organization Evolution Timeline' })
  getTimeline(@Req() req: types.AuthenticatedRequest) {
    return this.intelligenceService.getTimeline(req.user.companyId);
  }

  @Post('timeline')
  @ApiOperation({ summary: 'Add an event to the Evolution Timeline' })
  addTimelineEvent(
    @Req() req: types.AuthenticatedRequest,
    @Body() body: { title: string; description?: string; type: string },
  ) {
    return this.intelligenceService.addTimelineEvent(req.user.companyId, body);
  }
}
