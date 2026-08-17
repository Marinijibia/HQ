import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  SendOtpDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RegisterSuperAdminDto,
  LoginDto,
  RegisterDto,
  SetPasswordDto,
} from './dto/auth.dto';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller(['auth', 'api/auth'])
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('setup-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if initial Super Admin setup is required' })
  async checkSetupStatus() {
    return this.authService.checkSetupStatus();
  }

  @Post('register-super-admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Register the initial Super Administrator (Allowed only when 0 Super Admins exist)',
  })
  async registerSuperAdmin(@Body() dto: RegisterSuperAdminDto) {
    return this.authService.registerSuperAdmin(
      dto.name,
      dto.email,
      dto.password,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in with email and password — returns HQ session token',
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new HQ account with email and password' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name);
  }

  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Set account password using an OTP session token — upgrades to full auth token',
  })
  async setPassword(@Body() dto: SetPasswordDto) {
    return this.authService.setPassword(dto.sessionToken, dto.password);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate and send 6-digit OTP verification code' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify 6-digit OTP code — returns server session token',
  })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.code);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate password reset via email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('track-incomplete-onboarding')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Log incomplete onboarding lead with INCOMPLETE_ONBOARDING tag for re-engagement',
  })
  async trackIncompleteOnboarding(
    @Req() req: any,
    @Body()
    dto: {
      email: string;
      step?: number;
      orgName?: string;
      completed?: boolean;
    },
  ) {
    return this.authService.trackIncompleteOnboarding(
      dto.email,
      dto.step,
      dto.orgName,
      dto.completed,
      req.ip,
    );
  }

  @Get('check-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check if an email address is already registered in HQ',
  })
  async checkEmail(@Req() req: any, @Query('email') email: string) {
    return this.authService.checkEmail(email || '', req.ip);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user profile and permissions',
  })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getMe(user.uid);
  }
}
