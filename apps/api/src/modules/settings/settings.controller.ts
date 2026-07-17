import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import * as types from '../../common/interfaces/request.interface';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('org')
  @ApiOperation({ summary: 'Get organization settings' })
  getOrgSettings(@Req() req: types.AuthenticatedRequest) {
    return this.settingsService.getOrgSettings(req.user.companyId);
  }

  @Patch('org')
  @ApiOperation({ summary: 'Update organization settings' })
  updateOrgSettings(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: any,
  ) {
    return this.settingsService.updateOrgSettings(req.user.companyId, dto);
  }

  @Get('team')
  @ApiOperation({ summary: 'List team members' })
  getTeam(@Req() req: types.AuthenticatedRequest) {
    return this.settingsService.getTeamMembers(req.user.companyId);
  }

  @Post('team')
  @ApiOperation({ summary: 'Invite or add a new admin staff member' })
  addTeamMember(
    @Req() req: types.AuthenticatedRequest,
    @Body() body: { email: string; name: string; role: string },
  ) {
    return this.settingsService.addTeamMember(
      req.user.companyId,
      body.email,
      body.name,
      body.role,
    );
  }

  @Get('audit-logs')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Get organization audit logs' })
  getAuditLogs(@Req() req: types.AuthenticatedRequest) {
    return this.settingsService.getAuditLogs(req.user.companyId);
  }

  @Get('platform-stats')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMINISTRATOR)
  @ApiOperation({ summary: 'Get platform metrics and telemetry' })
  getPlatformStats() {
    return this.settingsService.getPlatformStats();
  }

  @Get('api-keys')
  @ApiOperation({ summary: 'List API keys' })
  listApiKeys(@Req() req: types.AuthenticatedRequest) {
    return this.settingsService.listApiKeys(req.user.companyId);
  }

  @Post('api-keys')
  @ApiOperation({ summary: 'Create a new API key' })
  createApiKey(
    @Req() req: types.AuthenticatedRequest,
    @Body() body: { name: string },
  ) {
    return this.settingsService.createApiKey(
      req.user.companyId,
      req.user.email,
      body.name,
    );
  }

  @Delete('api-keys/:id')
  @ApiOperation({ summary: 'Revoke an API key' })
  revokeApiKey(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.settingsService.revokeApiKey(req.user.companyId, id);
  }
}
