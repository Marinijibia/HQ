import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrgSettings(companyId: string) {
    let settings = await this.prisma.orgSettings.findUnique({
      where: { companyId },
    });
    if (!settings) {
      settings = await this.prisma.orgSettings.create({
        data: { companyId },
      });
    }
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, logoUrl: true, primaryColor: true, secondaryColor: true },
    });
    return {
      ...settings,
      companyName: company?.name || 'HQ Corporation',
      brandColor: company?.primaryColor || '#0A84FF',
      secondaryColor: company?.secondaryColor || '#8B5CF6',
      logoUrl: company?.logoUrl || null,
    };
  }

  async updateOrgSettings(companyId: string, dto: any) {
    const { companyName, brandColor, secondaryColor, logoUrl, primaryColor, name, ...settingsDto } = dto;
    
    // Update company brand elements if provided
    const companyUpdate: any = {};
    if (companyName || name) companyUpdate.name = companyName || name;
    if (brandColor || primaryColor) companyUpdate.primaryColor = brandColor || primaryColor;
    if (secondaryColor) companyUpdate.secondaryColor = secondaryColor;
    if (logoUrl !== undefined) companyUpdate.logoUrl = logoUrl;

    if (Object.keys(companyUpdate).length > 0) {
      await this.prisma.company.update({
        where: { id: companyId },
        data: companyUpdate,
      });
    }

    return this.prisma.orgSettings.upsert({
      where: { companyId },
      create: { companyId, ...settingsDto },
      update: settingsDto,
    });
  }

  async getAuditLogs(companyId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async listApiKeys(companyId: string) {
    return this.prisma.apiKey.findMany({
      where: { companyId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async createApiKey(companyId: string, userEmail: string, name: string) {
    const raw = `hq_${crypto.randomBytes(24).toString('hex')}`;
    const keyPrefix = raw.substring(0, 10);
    const keyHash = crypto.createHash('sha256').update(raw).digest('hex');
    const user = await this.prisma.user.findFirst({
      where: { email: userEmail, companyId },
      select: { id: true },
    });
    await this.prisma.apiKey.create({
      data: {
        companyId,
        createdById: user?.id ?? null,
        name,
        keyPrefix,
        keyHash,
      },
    });
    return { key: raw, keyPrefix, name };
  }

  async revokeApiKey(companyId: string, keyId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id: keyId, companyId },
    });
    if (!key) throw new NotFoundException('API key not found');
    return this.prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });
  }

  async getTeamMembers(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
