import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { UserRepository, UserWithRelations } from '../user/user.repository';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import Redis from 'ioredis';

// ─── JWT Payload ───────────────────────────────────────────────────────────────
export interface JwtPayload {
  uid: string;
  email: string;
  companyId?: string;
  role?: string;
  purpose?: string;
  emailVerified?: boolean;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly inMemoryOtpStore = new Map<string, { code: string; expiresAt: number }>();
  private readonly inMemoryTokenStore = new Map<string, { email: string; expiresAt: number }>();

  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    // Evict expired in-memory OTP/token entries every 5 minutes (Redis fallback cleanup)
    setInterval(() => {
      const now = Date.now();
      for (const [key, val] of this.inMemoryOtpStore.entries()) {
        if (val.expiresAt <= now) this.inMemoryOtpStore.delete(key);
      }
      for (const [key, val] of this.inMemoryTokenStore.entries()) {
        if (val.expiresAt <= now) this.inMemoryTokenStore.delete(key);
      }
    }, 5 * 60 * 1000);
  }

  // ─── JWT Helpers ─────────────────────────────────────────────────────────────

  private get jwtSecret(): string {
    return process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'hq-onboarding-secret';
  }

  signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiryDays = 30): string {
    const fullPayload: JwtPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * expiryDays,
    };
    const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    const sig = crypto.createHmac('sha256', this.jwtSecret).update(payloadB64).digest('base64url');
    return `${payloadB64}.${sig}`;
  }

  verifyJwt(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 2) throw new UnauthorizedException('Malformed token');
    const [payloadB64, sig] = parts;
    const expected = crypto.createHmac('sha256', this.jwtSecret).update(payloadB64).digest('base64url');
    if (sig !== expected) throw new UnauthorizedException('Invalid token signature');
    let payload: JwtPayload;
    try {
      payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    } catch {
      throw new UnauthorizedException('Malformed token payload');
    }
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token has expired');
    }
    return payload;
  }

  // ─── Redis Helpers ────────────────────────────────────────────────────────────

  private async safeRedisGet(key: string): Promise<string | null> {
    let result: string | null = null;
    if (this.redis) {
      try {
        result = await this.redis.get(key);
      } catch (err) {
        this.logger.warn(`Redis get notice for ${key}: ${(err as Error).message}`);
      }
    }
    if (result) return result;

    const memOtp = this.inMemoryOtpStore.get(key);
    if (memOtp && memOtp.expiresAt > Date.now()) return memOtp.code;
    const memToken = this.inMemoryTokenStore.get(key);
    if (memToken && memToken.expiresAt > Date.now()) return memToken.email;
    return null;
  }

  private async safeRedisSet(key: string, value: string, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    if (key.startsWith('otp:')) {
      this.inMemoryOtpStore.set(key, { code: value, expiresAt });
    } else {
      this.inMemoryTokenStore.set(key, { email: value, expiresAt });
    }

    if (this.redis) {
      try {
        await this.redis.set(key, value, 'EX', ttlSeconds);
      } catch (err) {
        this.logger.warn(`Redis set notice for ${key}: ${(err as Error).message}`);
      }
    }
  }

  private async safeRedisDel(key: string): Promise<void> {
    this.inMemoryOtpStore.delete(key);
    this.inMemoryTokenStore.delete(key);

    if (this.redis) {
      try {
        await this.redis.del(key);
      } catch (err) {
        this.logger.warn(`Redis del notice for ${key}: ${(err as Error).message}`);
      }
    }
  }

  // ─── Auth Methods ─────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(cleanEmail);

    if (!user || !user.passwordHash) {
      // Use constant-time comparison to avoid timing attacks
      await bcrypt.compare(password, '$2b$12$invalidhashfortimingprotection00000000000000000000');
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const token = this.signJwt({
      uid: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    });

    return {
      token,
      user: this.sanitizeUser(user),
      organization: user.company || null,
      permissions: this.resolveUserPermissions(user.role),
    };
  }

  async register(email: string, password: string, name?: string) {
    const cleanEmail = email.toLowerCase().trim();

    const existing = await this.userRepository.findByEmail(cleanEmail);
    if (existing) {
      throw new BadRequestException('An account with this email already exists');
    }

    if (!password || password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let defaultCompany = await this.userRepository.findDefaultCompany();
    if (!defaultCompany) {
      defaultCompany = await this.userRepository.createDefaultCompany();
    }

    const userId = crypto.randomUUID();
    const user = await this.userRepository.create({
      id: userId,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      displayName: name || cleanEmail.split('@')[0],
      passwordHash,
      emailVerified: false,
      companyId: defaultCompany.id,
      role: 'MEMBER',
    });

    this.emailService
      .sendWelcomeEmail(user.email, user.displayName || user.name || 'HQ User')
      .catch((err) => this.logger.warn(`Welcome email notice for ${cleanEmail}: ${err.message}`));

    const token = this.signJwt({
      uid: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    });

    return {
      token,
      user: this.sanitizeUser(user),
      organization: user.company || null,
      permissions: this.resolveUserPermissions(user.role),
    };
  }

  async setPassword(sessionToken: string, newPassword: string) {
    // Verify the onboarding session token issued by verifyOtp
    const payload = this.verifyJwt(sessionToken);
    if (payload.purpose !== 'onboarding-session') {
      throw new UnauthorizedException('Invalid session token purpose');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const cleanEmail = payload.email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(newPassword, 12);

    let user = await this.userRepository.findByEmail(cleanEmail);

    if (user) {
      // Existing user — set their password
      user = await this.userRepository.update(user.id, {
        passwordHash,
        emailVerified: true,
        lastLoginAt: new Date(),
      });
    } else {
      // New user — create account with hashed password
      let defaultCompany = await this.userRepository.findDefaultCompany();
      if (!defaultCompany) {
        defaultCompany = await this.userRepository.createDefaultCompany();
      }
      const userId = crypto.randomUUID();
      user = await this.userRepository.create({
        id: userId,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        displayName: cleanEmail.split('@')[0],
        passwordHash,
        emailVerified: true,
        companyId: defaultCompany.id,
        role: 'MEMBER',
      });
    }

    const token = this.signJwt({
      uid: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    });

    this.logger.log(`[Auth] Password set for ${cleanEmail} (uid: ${user.id})`);

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  // ─── OTP ─────────────────────────────────────────────────────────────────────

  async checkSetupStatus() {
    try {
      const superAdminCount = await this.prisma.user.count({
        where: { role: 'SUPER_ADMINISTRATOR', deletedAt: null },
      });
      const isSetupRequired = superAdminCount === 0;
      return {
        isSetupRequired,
        message: isSetupRequired
          ? 'Initial Super Admin registration is required.'
          : 'Initial Super Admin setup is complete.',
      };
    } catch {
      return { isSetupRequired: true, message: 'Initial Super Admin registration is required.' };
    }
  }

  async registerSuperAdmin(name: string, email: string, password: string) {
    let superAdminCount = 0;
    try {
      superAdminCount = await this.prisma.user.count({
        where: { role: 'SUPER_ADMINISTRATOR', deletedAt: null },
      });
    } catch {
      superAdminCount = 0;
    }

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
    const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;

    if (existingUser) {
      const updatedUser = await this.userRepository.update(existingUser.id, {
        role: 'SUPER_ADMINISTRATOR',
        name,
        displayName: name,
        companyId: defaultCompany.id,
        ...(passwordHash && { passwordHash }),
      });
      return {
        success: true,
        message: 'Existing account elevated to Super Administrator successfully.',
        user: this.sanitizeUser(updatedUser),
      };
    }

    const newUserId = crypto.randomUUID();
    const user = await this.userRepository.create({
      id: newUserId,
      email,
      name,
      displayName: name,
      emailVerified: true,
      passwordHash,
      companyId: defaultCompany.id,
      role: 'SUPER_ADMINISTRATOR',
    });

    return {
      success: true,
      message: 'Super Administrator registered successfully.',
      user: this.sanitizeUser(user),
    };
  }

  async sendOtp(email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Please provide a valid email address');
    }

    const cleanEmail = email.toLowerCase().trim();
    let recipientName = cleanEmail.split('@')[0];

    try {
      const user = await this.userRepository.findByEmail(cleanEmail);
      if (user) recipientName = user.displayName || user.name || recipientName;
    } catch (err) {
      this.logger.warn(`User lookup fallback for OTP (${cleanEmail}): ${(err as Error).message}`);
    }

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const redisKey = `otp:${cleanEmail}`;

    await this.safeRedisSet(redisKey, otpCode, 600);

    try {
      await this.trackIncompleteOnboarding(cleanEmail, 9, 'Unfinished Workspace Registration', false);
    } catch (err) {
      this.logger.warn(`Lead tracking notice for ${cleanEmail}: ${(err as Error).message}`);
    }

    this.logger.log(`🔑 [Auth Service] OTP Code generated for ${cleanEmail}: ${otpCode}`);

    try {
      await this.emailService.sendOtpEmail(cleanEmail, recipientName, otpCode, 10);
    } catch (err) {
      this.logger.warn(`Email dispatch notice for ${cleanEmail}: ${(err as Error).message}`);
    }

    return {
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      expiresInSeconds: 600,
    };
  }

  async verifyOtp(email: string, code: string) {
    const cleanEmail = email.toLowerCase().trim();
    const redisKey = `otp:${cleanEmail}`;
    const storedCode = await this.safeRedisGet(redisKey);

    if (!storedCode || storedCode !== code.trim()) {
      throw new BadRequestException('Invalid or expired verification code. Please request a new OTP code.');
    }

    await this.safeRedisDel(redisKey);

    // Check if user already exists in DB
    let existingUser: any = null;
    try {
      existingUser = await this.userRepository.findByEmail(cleanEmail);
      if (existingUser) {
        await this.userRepository.update(existingUser.id, {
          emailVerified: true,
          lastLoginAt: new Date(),
        });
      }
    } catch (err) {
      this.logger.warn(`User verification update notice (${cleanEmail}): ${(err as Error).message}`);
    }

    if (existingUser) {
      // Existing user -> return full auth token to log in directly
      const token = this.signJwt({
        uid: existingUser.id,
        email: existingUser.email,
        companyId: existingUser.companyId,
        role: existingUser.role,
      });

      return {
        success: true,
        message: 'Email verified and authenticated successfully',
        emailVerified: true,
        token,
        user: this.sanitizeUser(existingUser),
        organization: existingUser.company || null,
        permissions: this.resolveUserPermissions(existingUser.role),
      };
    }

    // New user (onboarding) -> issue temporary onboarding session token
    const uid = `otp_${crypto.createHash('sha256').update(cleanEmail).digest('hex').slice(0, 24)}`;
    const sessionToken = this.signJwt({
      uid,
      email: cleanEmail,
      emailVerified: true,
      purpose: 'onboarding-session',
    });

    return {
      success: true,
      message: 'Email verified successfully',
      emailVerified: true,
      sessionToken,
    };
  }

  async checkEmail(email: string): Promise<{ exists: boolean }> {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const user = await this.userRepository.findByEmail(cleanEmail);
      return { exists: !!user };
    } catch (err) {
      this.logger.warn(`checkEmail lookup notice for ${cleanEmail}: ${(err as Error).message}`);
      return { exists: false };
    }
  }

  async forgotPassword(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    let recipientName = cleanEmail.split('@')[0];

    try {
      const user = await this.userRepository.findByEmail(cleanEmail);
      if (user) recipientName = user.displayName || user.name || recipientName;
    } catch (err) {
      this.logger.warn(`User lookup fallback for reset (${cleanEmail}): ${(err as Error).message}`);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const redisKey = `pwd_reset:${resetToken}`;
    await this.safeRedisSet(redisKey, cleanEmail, 3600);

    const resetLink = `https://hq.netify.ng/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordResetEmail(cleanEmail, recipientName, resetLink);

    return {
      success: true,
      message: 'If an account exists for this email, password reset instructions have been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const redisKey = `pwd_reset:${token}`;
    const email = await this.safeRedisGet(redisKey);

    if (!email) throw new BadRequestException('Invalid or expired password reset link');

    await this.safeRedisDel(redisKey);

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    try {
      const user = await this.userRepository.findByEmail(email);
      if (user) {
        await this.userRepository.update(user.id, { passwordHash });
        this.logger.log(`[Auth] Password reset completed for ${email}`);
      }
    } catch (err) {
      this.logger.warn(`Password reset update notice for ${email}: ${(err as Error).message}`);
    }

    this.emailService
      .sendSecurityAlertEmail(
        email,
        'HQ User',
        'Password Reset Successful',
        'Your HQ account password was updated successfully.',
      )
      .catch(() => {});

    return { success: true, message: 'Password reset successfully' };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Authenticated user profile not found');

    const permissions = this.resolveUserPermissions(user.role);

    return {
      user: this.sanitizeUser(user),
      organization: user.company || null,
      company: user.company || null,
      permissions,
      role: user.role,
      subscription: { status: 'ACTIVE', plan: 'ENTERPRISE' },
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
    if (!user) throw new NotFoundException('User profile not found');
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: any) {
    const { deletedAt, deletedBy, createdBy, updatedBy, passwordHash, ...cleanUser } = user;
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

  async trackIncompleteOnboarding(email: string, step?: number, orgName?: string, completed?: boolean) {
    if (!email || !email.includes('@')) return { success: false };
    const cleanEmail = email.toLowerCase().trim();
    const leadKey = `lead:onboarding:${cleanEmail}`;
    const statusTag = completed ? 'COMPLETED_ONBOARDING' : 'INCOMPLETE_ONBOARDING';

    await this.safeRedisSet(
      leadKey,
      JSON.stringify({
        email: cleanEmail,
        tag: statusTag,
        lastStep: step || 1,
        orgName: orgName || 'Unfinished Workspace',
        updatedAt: new Date().toISOString(),
      }),
      86400 * 30,
    );

    this.logger.log(`📌 Tagged lead ${cleanEmail} as ${statusTag} (Step ${step || 1})`);
    return { success: true, email: cleanEmail, tag: statusTag };
  }
}
