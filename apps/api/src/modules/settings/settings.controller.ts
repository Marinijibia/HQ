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
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import * as types from '../../common/interfaces/request.interface';

export class AddTeamMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  role!: string;
}

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
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Update organization settings' })
  updateOrgSettings(@Req() req: types.AuthenticatedRequest, @Body() dto: any) {
    return this.settingsService.updateOrgSettings(req.user.companyId, dto);
  }

  @Get('team')
  @ApiOperation({ summary: 'List team members' })
  getTeam(@Req() req: types.AuthenticatedRequest) {
    return this.settingsService.getTeamMembers(req.user.companyId);
  }

  @Post('team')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Invite or add a new admin staff member' })
  addTeamMember(
    @Req() req: types.AuthenticatedRequest,
    @Body() body: AddTeamMemberDto,
  ) {
    return this.settingsService.addTeamMember(
      req.user.companyId,
      body.email,
      body.name,
      body.role,
      req.user.role,
    );
  }

  @Get('audit-logs')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Get organization audit logs' })
  getAuditLogs(@Req() req: types.AuthenticatedRequest) {
    return this.settingsService.getAuditLogs(req.user?.companyId);
  }

  @Get('kernel-traces')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Get AI Core Kernel Execution Traces' })
  getKernelTraces(@Req() req: types.AuthenticatedRequest) {
    return this.settingsService.getKernelTraces(req.user.companyId);
  }

  @Get('platform-stats')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMINISTRATOR)
  @ApiOperation({ summary: 'Get platform metrics and telemetry' })
  getPlatformStats() {
    return this.settingsService.getPlatformStats();
  }

  @Get('api-keys')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'List API keys' })
  listApiKeys(@Req() req: types.AuthenticatedRequest) {
    return this.settingsService.listApiKeys(req.user.companyId);
  }

  @Post('api-keys')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
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
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Revoke an API key' })
  revokeApiKey(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.settingsService.revokeApiKey(req.user.companyId, id);
  }

  @Get('voice-profile')
  @ApiOperation({ summary: 'Get user Asad voice training profile' })
  getVoiceProfile(@Req() req: types.AuthenticatedRequest) {
    return this.settingsService.getVoiceProfile(req.user.uid);
  }

  @Post('voice-profile')
  @ApiOperation({ summary: 'Save calibrated Asad voice profile & voice print' })
  saveVoiceProfile(@Req() req: types.AuthenticatedRequest, @Body() dto: any) {
    return this.settingsService.saveVoiceProfile(req.user.uid, dto);
  }

  @Get('governance')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({
    summary: 'Get governance policies, delegations, and decision audit logs',
  })
  getGovernanceData(@Req() req: types.AuthenticatedRequest) {
    return this.settingsService.getGovernanceData(req.user?.companyId);
  }

  @Post('governance/policies')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Register a new governance policy rule' })
  createPolicy(
    @Req() req: types.AuthenticatedRequest,
    @Body() body: { ruleText: string; category: string },
  ) {
    return this.settingsService.createPolicy({
      ...body,
      companyId: req.user?.companyId,
    });
  }

  @Delete('governance/policies/:id')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Delete a governance policy rule' })
  deletePolicy(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.settingsService.deletePolicy(id, req.user?.companyId);
  }

  @Post('governance/delegations')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Create a new delegation of authority' })
  createDelegation(
    @Req() req: types.AuthenticatedRequest,
    @Body()
    body: {
      delegator: string;
      delegatee: string;
      scope: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    return this.settingsService.createDelegation({
      ...body,
      companyId: req.user?.companyId,
    });
  }

  @Delete('governance/delegations/:id')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Revoke a delegation of authority' })
  deleteDelegation(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.settingsService.deleteDelegation(id, req.user?.companyId);
  }
}
