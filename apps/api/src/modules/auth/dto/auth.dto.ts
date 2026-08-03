import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FirebaseLoginDto {
  @ApiProperty({
    description: 'Firebase ID Token obtained from client-side Firebase Auth',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}

export class SendOtpDto {
  @ApiProperty({
    description: 'Email address to send verification OTP',
    example: 'user@netify.ng',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email address being verified',
    example: 'user@netify.ng',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: '6-digit OTP verification code received via email',
    example: '849201',
  })
  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Account email address for password reset',
    example: 'user@netify.ng',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token from email link',
    example: 'abc123token',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    description: 'New password (min 8 characters)',
    example: 'NewSecurePassword123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}
