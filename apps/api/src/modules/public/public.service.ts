import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async submitContact(dto: ContactDto) {
    this.logger.log(`📬 [Public Contact Submission] ${dto.name} (${dto.email})`);

    await this.emailService.sendRawEmail({
      to: ['sales@netify.ng', 'support@netify.ng'],
      subject: `[HQ Leads] New Contact Query from ${dto.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Website Contact Submission</h2>
          <p><strong>Name:</strong> ${dto.name}</p>
          <p><strong>Email:</strong> ${dto.email}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="background: #f4f4f5; padding: 12px; border-left: 4px solid #06b6d4;">
            ${dto.message}
          </blockquote>
        </div>
      `,
    });

    return {
      success: true,
      message: 'Thank you! Your contact message has been logged and dispatched to HQ Executive Support.',
      timestamp: new Date().toISOString(),
    };
  }

  async submitDemoRequest(dto: DemoRequestDto) {
    this.logger.log(`📅 [Public Demo Booking] ${dto.name} (${dto.email}) for ${dto.selectedDate} at ${dto.selectedTime}`);

    await this.emailService.sendRawEmail({
      to: dto.email,
      subject: `[HQ Executive Boardroom] Demo Meeting Confirmed for ${dto.selectedDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #06b6d4;">Your HQ Executive Boardroom Demo is Confirmed!</h2>
          <p>Dear ${dto.name},</p>
          <p>We have reserved your 15-minute operational walkthrough session:</p>
          <ul>
            <li><strong>Date:</strong> ${dto.selectedDate}</li>
            <li><strong>Time:</strong> ${dto.selectedTime} (GMT)</li>
            <li><strong>Company:</strong> ${dto.companyName || 'Corporate Workspace'}</li>
          </ul>
          <p>Our executive team will share a live courtroom sandboxing link 10 minutes prior to your session.</p>
        </div>
      `,
    });

    await this.emailService.sendRawEmail({
      to: ['demo@netify.ng', 'sales@netify.ng'],
      subject: `[VIP Demo Booking] ${dto.name} - ${dto.companyName || 'Corporate'}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New VIP Demo Booking</h2>
          <p><strong>Requestor:</strong> ${dto.name} (${dto.email})</p>
          <p><strong>Date & Time:</strong> ${dto.selectedDate} at ${dto.selectedTime}</p>
          <p><strong>Team Size:</strong> ${dto.teamSize || 'N/A'}</p>
        </div>
      `,
    });

    return {
      success: true,
      message: `Demo booking confirmed for ${dto.selectedDate} at ${dto.selectedTime}. Confirmation email sent to ${dto.email}.`,
      booking: dto,
    };
  }

  async submitCareerApplication(dto: CareerApplyDto) {
    this.logger.log(`💼 [Public Job Application] ${dto.name} (${dto.email}) for ${dto.jobTitle}`);

    await this.emailService.sendRawEmail({
      to: ['careers@netify.ng', 'hr@netify.ng'],
      subject: `[Job Application] ${dto.jobTitle} - ${dto.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Candidate Application</h2>
          <p><strong>Applicant:</strong> ${dto.name} (${dto.email})</p>
          <p><strong>Position:</strong> ${dto.jobTitle}</p>
          <p><strong>Portfolio / LinkedIn:</strong> <a href="${dto.linkedinOrPortfolio || '#'}">${dto.linkedinOrPortfolio || 'Not provided'}</a></p>
          <p><strong>Cover Letter / Notes:</strong></p>
          <blockquote style="background: #f4f4f5; padding: 12px; border-left: 4px solid #a855f7;">
            ${dto.coverLetter || 'No cover letter submitted.'}
          </blockquote>
        </div>
      `,
    });

    return {
      success: true,
      message: `Application for ${dto.jobTitle} received successfully. Candidate file logged for HR review.`,
    };
  }

  async submitSecurityRequest(dto: SecurityRequestDto) {
    this.logger.log(`🛡️ [Public Security Request] ${dto.name} (${dto.email}) requested ${dto.requestType}`);

    await this.emailService.sendRawEmail({
      to: dto.email,
      subject: `[HQ Trust Center] Security & Compliance Package (${dto.requestType})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #06b6d4;">HQ Trust Center Compliance Package</h2>
          <p>Dear ${dto.name},</p>
          <p>Thank you for requesting our zero-trust compliance package for <strong>${dto.companyName}</strong>.</p>
          <p>Requested Artifact: <strong>${dto.requestType}</strong></p>
          <p>Our Security Director (Legal Compliance Team) has generated your encrypted download package.</p>
        </div>
      `,
    });

    await this.emailService.sendRawEmail({
      to: ['security@netify.ng', 'legal@netify.ng'],
      subject: `[Security Package Access] ${dto.requestType} requested by ${dto.name} (${dto.companyName})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Security Package Request Log</h2>
          <p><strong>User:</strong> ${dto.name} (${dto.email})</p>
          <p><strong>Company:</strong> ${dto.companyName}</p>
          <p><strong>Artifact:</strong> ${dto.requestType}</p>
        </div>
      `,
    });

    return {
      success: true,
      message: `Security package ${dto.requestType} dispatched to ${dto.email}.`,
    };
  }
}
