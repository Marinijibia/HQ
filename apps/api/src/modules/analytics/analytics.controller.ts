import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../auth/auth.guard';
import * as types from '../../common/interfaces/request.interface';
import type { Response } from 'express';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('briefing')
  @ApiOperation({ summary: 'Retrieve CEO conversational briefing report' })
  async getBriefing(@Req() req: types.AuthenticatedRequest) {
    return this.analyticsService.getBriefing(req.user.companyId);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Fetch business intelligence telemetry charts payload' })
  async getMetrics(@Req() req: types.AuthenticatedRequest) {
    return this.analyticsService.getMetrics(req.user.companyId);
  }

  @Get('export')
  @ApiOperation({ summary: 'Download compiled CSV business analysis report' })
  async exportReport(
    @Req() req: types.AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const csvContent = await this.analyticsService.exportReport(req.user.companyId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="hq_business_report_${Date.now()}.csv"`,
    );
    return res.send(csvContent);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Fetch live database workspace activity stream' })
  async getActivity(@Req() req: types.AuthenticatedRequest) {
    return this.analyticsService.getActivity(req.user.companyId);
  }
}
