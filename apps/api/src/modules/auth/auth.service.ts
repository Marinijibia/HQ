import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { UserRepository, UserWithRelations } from '../user/user.repository';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async checkSetupStatus() {
    const superAdminCount = await this.prisma.user.count({
      where: {
        role: 'SUPER_ADMINISTRATOR',
        deletedAt: null,
      },
    });

    const isSetupRequired = superAdminCount === 0;
    return {
      isSetupRequired,
      message: isSetupRequired
        ? 'Initial Super Admin registration is required.'
        : 'Initial Super Admin setup is complete.',
    };
  }

  async registerSuperAdmin(name: string, email: string, password: string) {
    const superAdminCount = await this.prisma.user.count({
      where: {
        role: 'SUPER_ADMINISTRATOR',
        deletedAt: null,
      },
    });

    if (superAdminCount > 0) {
      throw new BadRequestException(
        'Initial Super Admin setup has already been completed. Registration is locked.',
      );
    }

    let defaultCompany = await this.userRepository.findDefaultCompany();
    if (!defaultCompany) {
      defaultCompany = await this.userRepository.createDefaultCompany();
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      const updatedUser = await this.userRepository.update(existingUser.id, {
        role: 'SUPER_ADMINISTRATOR',
        name,
        displayName: name,
        companyId: defaultCompany.id,
      });
      return {
        success: true,
        message: 'Existing account elevated to Super Administrator successfully.',
        user: this.sanitizeUser(updatedUser),
      };
    }

    const newUserId = `admin_${Date.now()}`;
    const user = await this.userRepository.create({
      id: newUserId,
      firebaseUid: newUserId,
      email,
      name,
      displayName: name,
      emailVerified: true,
      companyId: defaultCompany.id,
      role: 'SUPER_ADMINISTRATOR',
    });

    return {
      success: true,
      message: 'Super Administrator registered successfully.',
      user: this.sanitizeUser(user),
    };
  }

  async authenticateFirebase(idToken: string) {
    let firebasePayload: {
      uid: string;
      email: string;
      role: string;
      companyId: string;
      displayName?: string;
      photoURL?: string;
      emailVerified?: boolean;
    };

    try {
      firebasePayload = await this.firebaseService.verifyIdToken(idToken);
    } catch (error) {
      this.logger.warn(`Firebase token verification failed: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid or expired authentication credentials');
    }

    const { uid, email, displayName, photoURL, emailVerified } = firebasePayload;

    let user: UserWithRelations | null = await this.userRepository.findByFirebaseUid(uid);
    let isNewUser = false;

    if (!user) {
      user = await this.userRepository.findByEmail(email);
    }

    if (!user) {
      let defaultCompany = await this.userRepository.findDefaultCompany();
      if (!defaultCompany) {
        defaultCompany = await this.prisma.company.create({
          data: {
            name: 'Default HQ Organization',
            slug: 'default-hq-org',
          },
        });
      }

      user = await this.userRepository.create({
        id: uid,
        firebaseUid: uid,
        email,
        name: displayName || (email ? email.split('@')[0] : 'HQ User'),
        displayName,
        photoUrl: photoURL,
        emailVerified: emailVerified ?? false,
        companyId: defaultCompany.id,
        role: firebasePayload.role || 'MEMBER',
      });
      isNewUser = true;
      this.logger.log(`Created new HQ user for ${email} (UID: ${uid})`);

      this.emailService
        .sendWelcomeEmail(user.email, user.displayName || user.name || 'HQ User')
        .catch((err) =>
          this.logger.warn(`Failed to send Welcome email to ${email}: ${err.message}`),
        );
    } else {
      user = await this.userRepository.update(user.id, {
        firebaseUid: uid,
        displayName: displayName || user.displayName || user.name,
        photoUrl: photoURL || user.photoUrl,
        emailVerified: emailVerified ?? user.emailVerified,
        lastLoginAt: new Date(),
      });
      this.logger.log(`Successful login for user ${email} (ID: ${user.id})`);
    }

    try {
      await this.firebaseService.setCustomUserClaims(uid, {
        role: user.role,
        companyId: user.companyId,
      });
    } catch (err) {
      this.logger.warn(`Failed to sync custom claims for ${uid}: ${(err as Error).message}`);
    }

    const permissions = this.resolveUserPermissions(user.role);

    return {
      user: this.sanitizeUser(user),
      organization: user.company || null,
      permissions,
      role: user.role,
      isNewUser,
    };
  }

  async sendOtp(email: string) {
    const user = await this.userRepository.findByEmail(email);
    const recipientName = user ? user.displayName || user.name || 'HQ User' : email.split('@')[0];

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `otp:${email.toLowerCase()}`;

    await this.redis.set(redisKey, otpCode, 'EX', 600);

    this.logger.log(`🔑 [Auth Service] OTP Code generated for ${email}: ${otpCode}`);

    await this.emailService.sendOtpEmail(email, recipientName, otpCode, 10);

    return {
      success: true,
      message: `Verification code sent to ${email}`,
      expiresInSeconds: 600,
    };
  }

  async verifyOtp(email: string, code: string) {
    const redisKey = `otp:${email.toLowerCase()}`;
    const storedCode = await this.redis.get(redisKey);

    if (!storedCode || storedCode !== code.trim()) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.redis.del(redisKey);

    let user = await this.userRepository.findByEmail(email);
    if (user) {
      user = await this.userRepository.update(user.id, {
        emailVerified: true,
      });
    }

    return {
      success: true,
      message: 'Email verified successfully',
      emailVerified: true,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    const recipientName = user ? user.displayName || user.name || 'HQ User' : email.split('@')[0];

    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const redisKey = `pwd_reset:${resetToken}`;

    await this.redis.set(redisKey, email.toLowerCase(), 'EX', 3600);

    const resetLink = `https://hq.netify.ng/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordResetEmail(email, recipientName, resetLink);

    return {
      success: true,
      message: 'If an account exists for this email, password reset instructions have been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const redisKey = `pwd_reset:${token}`;
    const email = await this.redis.get(redisKey);

    if (!email) {
      throw new BadRequestException('Invalid or expired password reset link');
    }

    await this.redis.del(redisKey);

    const user = await this.userRepository.findByEmail(email);
    if (user && user.firebaseUid) {
      try {
        await this.firebaseService.updateUserPassword(user.firebaseUid, newPassword);
      } catch (e) {
        this.logger.warn(`Failed updating Firebase Auth password for ${email}: ${(e as Error).message}`);
      }
    }

    this.emailService
      .sendSecurityAlertEmail(
        email,
        user?.displayName || 'HQ User',
        'Password Reset Successful',
        'Your HQ account password was updated successfully.',
      )
      .catch(() => {});

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Authenticated user profile not found');
    }

    const permissions = this.resolveUserPermissions(user.role);

    return {
      user: this.sanitizeUser(user),
      organization: user.company || null,
      company: user.company || null,
      permissions,
      role: user.role,
      subscription: {
        status: 'ACTIVE',
        plan: 'ENTERPRISE',
      },
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
        photoUrl: user.photoUrl,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: any) {
    const { deletedAt, deletedBy, createdBy, updatedBy, ...cleanUser } = user;
    return cleanUser;
  }

  private resolveUserPermissions(role: string): string[] {
    switch (role) {
      case 'ORGANIZATION_OWNER':
      case 'SUPER_ADMINISTRATOR':
        return ['*'];
      case 'ADMINISTRATOR':
        return ['read:*', 'write:*', 'manage:team', 'manage:executives'];
      case 'EXECUTIVE_USER':
      case 'DEPARTMENT_MANAGER':
      case 'TEAM_LEAD':
        return ['read:*', 'write:missions', 'write:conversations'];
      case 'MEMBER':
      default:
        return ['read:own', 'write:own'];
    }
  }
}
