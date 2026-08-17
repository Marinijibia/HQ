import {
  Injectable,
  Logger,
  BadRequestException,
  Optional,
  Inject,
} from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class ContactDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class DemoRequestDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  teamSize?: string;

  @IsString()
  @IsNotEmpty()
  selectedDate!: string;

  @IsString()
  @IsNotEmpty()
  selectedTime!: string;
}

export class CareerApplyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  @IsString()
  @IsOptional()
  linkedinOrPortfolio?: string;

  @IsString()
  @IsOptional()
  coverLetter?: string;
}

export class SecurityRequestDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  requestType!: 'SOC2_REPORT' | 'SECURITY_DECK' | 'COMPLIANCE_AUDIT';
}

function escapeHtml(text?: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);
  private readonly rateLimits = new Map<
    string,
    { count: number; expiresAt: number }
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    @Optional()
    @Inject('REDIS_CLIENT')
    private readonly redisClient?: Redis,
  ) {}

  private async checkRateLimit(
    key: string,
    max: number = 10,
    windowMs: number = 600000,
  ) {
    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        const redisKey = `rate:public:${key}`;
        const count = await this.redisClient.incr(redisKey);
        if (count === 1) {
          await this.redisClient.pexpire(redisKey, windowMs);
        }
        if (count > max) {
          throw new BadRequestException(
            'Too many submission requests. Please try again later.',
          );
        }
        return;
      } catch (err) {
        if (err instanceof BadRequestException) throw err;
        this.logger.warn(
          `Redis rate limiter notice for ${key}: ${(err as Error).message}`,
        );
      }
    }

    // Resilient local memory fallback
    const now = Date.now();
    const entry = this.rateLimits.get(key);
    if (!entry || entry.expiresAt < now) {
      this.rateLimits.set(key, { count: 1, expiresAt: now + windowMs });
      return;
    }
    if (entry.count >= max) {
      throw new BadRequestException(
        'Too many submission requests. Please try again later.',
      );
    }
    entry.count++;
  }

  async submitContact(dto: ContactDto, clientIp?: string) {
    await this.checkRateLimit(`contact:${clientIp || dto.email}`);
    this.logger.log(
      `📬 [Public Contact Submission] ${escapeHtml(dto.name)} (${escapeHtml(dto.email)})`,
    );

    const safeName = escapeHtml(dto.name);
    const safeEmail = escapeHtml(dto.email);
    const safeMessage = escapeHtml(dto.message);

    await this.emailService.sendRawEmail({
      to: ['sales@netify.ng', 'support@netify.ng'],
      subject: `[HQ Leads] New Contact Query from ${safeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Website Contact Submission</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="background: #f4f4f5; padding: 12px; border-left: 4px solid #06b6d4;">
            ${safeMessage}
          </blockquote>
        </div>
      `,
    });

    return {
      success: true,
      message:
        'Thank you! Your contact message has been logged and dispatched to HQ Executive Support.',
      timestamp: new Date().toISOString(),
    };
  }

  async submitDemoRequest(dto: DemoRequestDto, clientIp?: string) {
    await this.checkRateLimit(`demo:${clientIp || dto.email}`);
    this.logger.log(
      `📅 [Public Demo Booking] ${escapeHtml(dto.name)} (${escapeHtml(dto.email)}) for ${escapeHtml(dto.selectedDate)} at ${escapeHtml(dto.selectedTime)}`,
    );

    const safeName = escapeHtml(dto.name);
    const safeEmail = escapeHtml(dto.email);
    const safeDate = escapeHtml(dto.selectedDate);
    const safeTime = escapeHtml(dto.selectedTime);
    const safeCompany = escapeHtml(dto.companyName || 'Corporate Workspace');
    const safeTeamSize = escapeHtml(dto.teamSize || 'N/A');

    await this.emailService.sendRawEmail({
      to: dto.email,
      subject: `[HQ Executive Boardroom] Demo Meeting Confirmed for ${safeDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #06b6d4;">Your HQ Executive Boardroom Demo is Confirmed!</h2>
          <p>Dear ${safeName},</p>
          <p>We have reserved your 15-minute operational walkthrough session:</p>
          <ul>
            <li><strong>Date:</strong> ${safeDate}</li>
            <li><strong>Time:</strong> ${safeTime} (GMT)</li>
            <li><strong>Company:</strong> ${safeCompany}</li>
          </ul>
          <p>Our executive team will share a live courtroom sandboxing link 10 minutes prior to your session.</p>
        </div>
      `,
    });

    await this.emailService.sendRawEmail({
      to: ['demo@netify.ng', 'sales@netify.ng'],
      subject: `[VIP Demo Booking] ${safeName} - ${safeCompany}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New VIP Demo Booking</h2>
          <p><strong>Requestor:</strong> ${safeName} (${safeEmail})</p>
          <p><strong>Date & Time:</strong> ${safeDate} at ${safeTime}</p>
          <p><strong>Team Size:</strong> ${safeTeamSize}</p>
        </div>
      `,
    });

    return {
      success: true,
      message: `Demo booking confirmed for ${safeDate} at ${safeTime}. Confirmation email sent to ${safeEmail}.`,
      booking: dto,
    };
  }

  async submitCareerApplication(dto: CareerApplyDto, clientIp?: string) {
    await this.checkRateLimit(`careers:${clientIp || dto.email}`);
    this.logger.log(
      `💼 [Public Job Application] ${escapeHtml(dto.name)} (${escapeHtml(dto.email)}) for ${escapeHtml(dto.jobTitle)}`,
    );

    const safeName = escapeHtml(dto.name);
    const safeEmail = escapeHtml(dto.email);
    const safeTitle = escapeHtml(dto.jobTitle);
    const safePortfolio = escapeHtml(dto.linkedinOrPortfolio || 'Not provided');
    const safeCoverLetter = escapeHtml(dto.coverLetter || 'No cover letter submitted.');

    await this.emailService.sendRawEmail({
      to: ['careers@netify.ng', 'hr@netify.ng'],
      subject: `[Job Application] ${safeTitle} - ${safeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Candidate Application</h2>
          <p><strong>Applicant:</strong> ${safeName} (${safeEmail})</p>
          <p><strong>Position:</strong> ${safeTitle}</p>
          <p><strong>Portfolio / LinkedIn:</strong> ${safePortfolio}</p>
          <p><strong>Cover Letter / Notes:</strong></p>
          <blockquote style="background: #f4f4f5; padding: 12px; border-left: 4px solid #a855f7;">
            ${safeCoverLetter}
          </blockquote>
        </div>
      `,
    });

    return {
      success: true,
      message: `Application for ${safeTitle} received successfully. Candidate file logged for HR review.`,
    };
  }

  async submitSecurityRequest(dto: SecurityRequestDto, clientIp?: string) {
    await this.checkRateLimit(`security:${clientIp || dto.email}`);
    this.logger.log(
      `🛡️ [Public Security Request] ${escapeHtml(dto.name)} (${escapeHtml(dto.email)}) requested ${escapeHtml(dto.requestType)}`,
    );

    const safeName = escapeHtml(dto.name);
    const safeEmail = escapeHtml(dto.email);
    const safeCompany = escapeHtml(dto.companyName);
    const safeType = escapeHtml(dto.requestType);

    await this.emailService.sendRawEmail({
      to: dto.email,
      subject: `[HQ Trust Center] Security & Compliance Package (${safeType})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #06b6d4;">HQ Trust Center Compliance Package</h2>
          <p>Dear ${safeName},</p>
          <p>Thank you for requesting our zero-trust compliance package for <strong>${safeCompany}</strong>.</p>
          <p>Requested Artifact: <strong>${safeType}</strong></p>
          <p>Our Security Director (Legal Compliance Team) has generated your encrypted download package.</p>
        </div>
      `,
    });

    await this.emailService.sendRawEmail({
      to: ['security@netify.ng', 'legal@netify.ng'],
      subject: `[Security Package Access] ${safeType} requested by ${safeName} (${safeCompany})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Security Package Request Log</h2>
          <p><strong>User:</strong> ${safeName} (${safeEmail})</p>
          <p><strong>Company:</strong> ${safeCompany}</p>
          <p><strong>Artifact:</strong> ${safeType}</p>
        </div>
      `,
    });

    return {
      success: true,
      message: `Security package ${safeType} dispatched to ${safeEmail}.`,
    };
  }
}
