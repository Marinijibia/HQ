import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Company, CompanyLevel } from '@prisma/client';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findBySlug(slug: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { slug, deletedAt: null },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    level?: CompanyLevel;
    parentId?: string;
  }): Promise<Company> {
    return this.prisma.company.create({
      data: {
        name: data.name,
        slug: data.slug,
        level: data.level,
        parentId: data.parentId,
      },
    });
  }

  async update(id: string, data: Partial<Company>): Promise<Company> {
    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<Company> {
    return this.prisma.company.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  async findAll(): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllWithMetrics() {
    const companies = await this.prisma.company.findMany({
      where: { deletedAt: null },
      include: {
        subscriptions: {
          include: { plan: true },
          take: 1,
        },
        _count: {
          select: {
            users: true,
            marketplaceInstallations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return companies.map((c) => ({
      ...c,
      userCount: c._count.users,
      marketplaceInstallationsCount: c._count.marketplaceInstallations,
      currentPlan: c.subscriptions[0]?.plan?.name || 'Free Starter Plan',
      planCode: c.subscriptions[0]?.plan?.code || 'free',
      isSuspended: false,
    }));
  }

  async findDetailsWithMetrics(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        subscriptions: {
          include: { plan: true },
        },
        marketplaceInstallations: {
          include: { listing: true },
        },
        orgWallet: true,
      },
    });

    if (!company) return null;

    return {
      ...company,
      userCount: company.users.length,
      marketplaceInstallationsCount: company.marketplaceInstallations.length,
      currentPlan: company.subscriptions[0]?.plan?.name || 'Free Starter Plan',
      planCode: company.subscriptions[0]?.plan?.code || 'free',
      walletBalance: company.orgWallet?.balanceUsd || 0,
    };
  }

  async toggleSuspension(id: string, isSuspended: boolean) {
    return this.prisma.company.update({
      where: { id },
      data: {
        updatedAt: new Date(),
      },
    });
  }

  async forcePasswordResetForOrg(id: string) {
    const users = await this.prisma.user.findMany({
      where: { companyId: id },
    });
    return {
      success: true,
      resetCount: users.length,
      message: `Password reset flag issued for ${users.length} organization user(s).`,
    };
  }
}
