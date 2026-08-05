import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  FirebaseLoginDto,
  SendOtpDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RegisterSuperAdminDto,
} from './dto/auth.dto';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
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
  @ApiOperation({ summary: 'Register the initial Super Administrator (Allowed only when 0 Super Admins exist)' })
  async registerSuperAdmin(@Body() dto: RegisterSuperAdminDto) {
    return this.authService.registerSuperAdmin(dto.name, dto.email, dto.password);
  }

  @Post('firebase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with Firebase ID Token and resolve HQ user context' })
  async authenticateFirebase(@Body() dto: FirebaseLoginDto) {
    return this.authService.authenticateFirebase(dto.idToken);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a 6-digit OTP verification code via Resend email' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 6-digit OTP code and mark email as verified' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.code);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset link via Resend email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password using token from email link' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated HQ user with organization, role, and permissions' })
  async getMe(@CurrentUser() currentUser: { uid: string }) {
    return this.authService.getMe(currentUser.uid);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out and acknowledge session termination' })
  async logout() {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user profile' })
  async getProfile(@CurrentUser() currentUser: { uid: string }) {
    return this.authService.getProfile(currentUser.uid);
  }
}
