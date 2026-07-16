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

  async getPlatformStats() {
    const totalCompanies = await this.prisma.company.count();
    const activeSubs = await this.prisma.subscription.count({
      where: { status: 'ACTIVE' },
    });
    const totalMissions = await this.prisma.mission.count();

    const planCounts = await this.prisma.subscription.groupBy({
      by: ['planId'],
      _count: {
        id: true,
      },
    });

    const plans = await this.prisma.plan.findMany();
    const planDistribution = plans.map((p) => {
      const match = planCounts.find((pc) => pc.planId === p.id);
      return {
        planName: p.name,
        count: match ? match._count.id : 0,
      };
    });

    const recentCompanies = await this.prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
      },
    });

    const activeSubList = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });

    let mrr = 0;
    activeSubList.forEach((sub) => {
      if (sub.plan?.code === 'enterprise') {
        mrr += 150000;
      } else if (sub.plan?.code === 'growth') {
        mrr += 25000;
      }
    });

    const recentTransactions = activeSubList.slice(0, 4).map((sub, idx) => ({
      id: `tx-${idx}`,
      tenant: { companyName: sub.companyId },
      amount: sub.plan?.code === 'enterprise' ? 150000 : 25000,
      status: 'SUCCEEDED',
      createdAt: sub.createdAt.toISOString(),
    }));

    for (const tx of recentTransactions) {
      const comp = await this.prisma.company.findUnique({
        where: { id: tx.tenant.companyName },
        select: { name: true },
      });
      if (comp) {
        tx.tenant.companyName = comp.name;
      }
    }

    return {
      totalCompanies,
      activeSubs,
      mrr,
      totalMissions,
      planDistribution,
      recentCompanies,
      recentTransactions,
      systemTelemetry: {
        uptimeSeconds: Math.floor(process.uptime()),
        memory: {
          rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB`,
          heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
          heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(1)} MB`,
        },
        activeSockets: 12,
      },
    };
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
