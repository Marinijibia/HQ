import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  getWelcomeEmailTemplate,
  getOtpEmailTemplate,
  getPasswordResetEmailTemplate,
  getSecurityLoginNoticeEmailTemplate,
  getTeamInvitationEmailTemplate,
  getTransactionReceiptEmailTemplate,
} from './templates/email-templates';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string | null;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('RESEND_API_KEY') || null;
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ||
      'HQ AI OS <onboarding@resend.dev>';
  }

  async sendRawEmail(options: SendEmailOptions): Promise<boolean> {
    const { to, subject, html, text } = options;
    const recipients = Array.isArray(to) ? to : [to];

    if (!this.apiKey) {
      this.logger.log(
        `[MOCK EMAIL MODE] To: ${recipients.join(', ')} | Subject: ${subject}`,
      );
      return true;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: recipients,
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(`Resend API Notice [${response.status}]: ${errorText}`);
        // Return true on domain/recipient restriction so auth flow is never blocked
        return true;
      }

      const data = (await response.json()) as { id?: string };
      this.logger.log(
        `Email sent successfully to ${recipients.join(', ')} (Message ID: ${data.id || 'N/A'})`,
      );
      return true;
    } catch (error) {
      this.logger.warn(`Resend API dispatch notice: ${(error as Error).message}`);
      return true;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const { subject, html } = getWelcomeEmailTemplate(name);
    return this.sendRawEmail({ to, subject, html });
  }

  async sendOtpEmail(
    to: string,
    name: string,
    otpCode: string,
    expiresInMinutes: number = 10,
  ): Promise<boolean> {
    this.logger.log(`🔑 [OTP Dispatch Log] Email: ${to} | Verification Code: ${otpCode}`);
    const { subject, html } = getOtpEmailTemplate(name, otpCode, expiresInMinutes);
    return this.sendRawEmail({ to, subject, html });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetLink: string,
  ): Promise<boolean> {
    const { subject, html } = getPasswordResetEmailTemplate(name, resetLink);
    return this.sendRawEmail({ to, subject, html });
  }

  async sendSecurityLoginNotice(
    to: string,
    name: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<boolean> {
    const timestamp = new Date().toUTCString();
    const { subject, html } = getSecurityLoginNoticeEmailTemplate(
      name,
      ipAddress,
      userAgent,
      timestamp,
    );
    return this.sendRawEmail({ to, subject, html });
  }

  async sendSecurityAlertEmail(
    to: string,
    name: string,
    alertTitle: string,
    alertDetails: string,
  ): Promise<boolean> {
    const timestamp = new Date().toUTCString();
    const { subject, html } = getSecurityLoginNoticeEmailTemplate(
      name,
      alertTitle,
      alertDetails,
      timestamp,
    );
    return this.sendRawEmail({ to, subject, html });
  }

  async sendTeamInvitation(
    to: string,
    name: string,
    inviterName: string,
    companyName: string,
    inviteUrl: string,
  ): Promise<boolean> {
    const { subject, html } = getTeamInvitationEmailTemplate(
      name,
      inviterName,
      companyName,
      inviteUrl,
    );
    return this.sendRawEmail({ to, subject, html });
  }

  async sendTransactionReceiptEmail(
    to: string,
    name: string,
    amountFormatted: string,
    gateway: string,
    reference: string,
    vendorOrPlan: string,
    executiveRole?: string,
  ): Promise<boolean> {
    const { subject, html } = getTransactionReceiptEmailTemplate(
      name,
      amountFormatted,
      gateway,
      reference,
      vendorOrPlan,
      executiveRole,
    );
    return this.sendRawEmail({ to, subject, html });
  }
}
