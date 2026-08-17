import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { PrismaService } from '../database/prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
import { CircleClientService } from '../wallet/circle-client.service';

export class BalanceAdjustmentDto {
  @IsNumber()
  @IsNotEmpty()
  amountUsd!: number;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

@ApiTags('Admin Billing')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMINISTRATOR)
@Controller('admin/billing')
export class AdminBillingController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly circleClient: CircleClientService,
  ) {}

  @Get('stats')
  @ApiOperation({
    summary:
      'Get global Treasury KPIs, system liabilities, and revenue volume for Super Admin',
  })
  async getGlobalStats() {
    // 1. Fetch Master Circle Reserve
    const masterVault = await this.circleClient.getMasterWalletReserve();

    // 2. Fetch total Virtual USD Liabilities across all companies
    const orgWallets: any[] =
      ((await this.prisma
        .$queryRawUnsafe(
          `
      SELECT SUM(balance_usd) as total_usd, COUNT(id) as wallet_count FROM organization_wallets
    `,
        )
        .catch(() => [])) as any[]) || [];

    const totalSystemUsdLiabilities =
      orgWallets.length > 0 && orgWallets[0].total_usd
        ? parseFloat(orgWallets[0].total_usd)
        : 0.0;
    const totalOrgWalletsCount =
      orgWallets.length > 0 && orgWallets[0].wallet_count
        ? parseInt(orgWallets[0].wallet_count, 10)
        : 0;

    // 3. Fetch Gross Processed Volume & Total Transactions
    const txStats: any[] =
      ((await this.prisma
        .$queryRawUnsafe(
          `
      SELECT 
        COUNT(id) as total_txs,
        SUM(amount_usd) as gross_volume_usd,
        SUM(CASE WHEN type = 'DEPOSIT' THEN amount_usd ELSE 0 END) as deposit_volume,
        SUM(CASE WHEN type = 'SUBSCRIPTION_PAYMENT' THEN amount_usd ELSE 0 END) as subscription_volume,
        SUM(CASE WHEN type = 'AGENT_PAYMENT' THEN amount_usd ELSE 0 END) as agent_autonomous_volume
      FROM wallet_transactions
    `,
        )
        .catch(() => [])) as any[]) || [];

    const s = txStats[0] || {};
    const totalTransactions = parseInt(s.total_txs || '0', 10);
    const grossVolumeUsd = parseFloat(s.gross_volume_usd || '0');
    const depositVolume = parseFloat(s.deposit_volume || '0');
    const subscriptionVolume = parseFloat(s.subscription_volume || '0');
    const agentAutonomousVolume = parseFloat(s.agent_autonomous_volume || '0');

    // 4. Fetch Subscriptions Count Breakdown
    const activeSubCount = await this.prisma.subscription
      .count({ where: { status: 'ACTIVE' } })
      .catch(() => 0);
    const pastDueSubCount = await this.prisma.subscription
      .count({ where: { status: 'PAST_DUE' } })
      .catch(() => 0);

    return {
      masterCircleReserveUsdc: masterVault.usdcBalance,
      masterCircleWalletId: masterVault.walletId,
      totalSystemUsdLiabilities,
      totalOrgWalletsCount,
      totalTransactions,
      grossVolumeUsd,
      depositVolume,
      subscriptionVolume,
      agentAutonomousVolume,
      activeSubCount,
      pastDueSubCount,
    };
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'List global USDC Agentic & Fiat transactions across all tenants',
  })
  async getAllTransactions(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('limit') limitStr: string = '100',
  ) {
    const limit = parseInt(limitStr, 10) || 100;
    const where: any = {};

    if (type) {
      where.type = type.toUpperCase();
    }
    if (status) {
      where.status = status.toUpperCase();
    }
    if (search) {
      where.OR = [
        { vendorName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { circleTxId: { contains: search, mode: 'insensitive' } },
        { companyId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const txs = await this.prisma.walletTransaction.findMany({
      where,
      include: { company: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return txs.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      companyName: r.company?.name || 'Organization Workspace',
      type: r.type,
      amountUsd: Number(r.amountUsd || 0),
      amountUsdc: Number(r.amountUsdc || 0),
      vendorAddress: r.vendorAddress,
      vendorName: r.vendorName || 'System / Provider',
      circleTxId: r.circleTxId,
      blockchainTxHash: r.blockchainTxHash,
      status: r.status,
      description: r.description,
      executiveRoleKey: r.executiveRoleKey,
      createdAt: r.createdAt,
    }));
  }

  @Get('wallets')
  @ApiOperation({
    summary:
      'List all customer organization wallets and assigned AI Executive allowances',
  })
  async getAllWallets() {
    const wallets = await this.prisma.organizationWallet.findMany({
      include: {
        company: {
          include: {
            agentAllowances: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return wallets.map((w) => ({
      id: w.id,
      companyId: w.companyId,
      companyName: w.company?.name || 'Organization Workspace',
      companySlug: w.company?.slug,
      balanceUsd: Number(w.balanceUsd || 0),
      currency: w.currency || 'USD',
      status: w.status || 'ACTIVE',
      updatedAt: w.updatedAt,
      allowances: (w.company?.agentAllowances || []).map((a) => ({
        roleKey: a.roleKey,
        monthlyLimit: Number(a.monthlyLimit || 500),
        currentMonthSpent: Number(a.currentMonthSpent || 0),
        singleTxLimit: Number(a.singleTxLimit || 50),
        requireApprovalAbove: Number(a.requireApprovalAbove || 50),
      })),
    }));
  }

  @Post('wallets/:companyId/freeze')
  @ApiOperation({
    summary: 'Emergency Freeze / Unfreeze an organization wallet',
  })
  async toggleWalletFreeze(@Param('companyId') companyId: string) {
    const wallet = await this.prisma.organizationWallet.findUnique({
      where: { companyId },
    });

    const currentStatus = wallet?.status || 'ACTIVE';
    const nextStatus = currentStatus === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';

    await this.prisma.organizationWallet.upsert({
      where: { companyId },
      update: { status: nextStatus },
      create: {
        companyId,
        balanceUsd: 100.0,
        currency: 'USD',
        status: nextStatus,
      },
    });

    // Log admin audit event
    await this.prisma.auditLog
      .create({
        data: {
          companyId,
          eventType:
            nextStatus === 'FROZEN'
              ? 'admin.wallet_frozen'
              : 'admin.wallet_unfrozen',
          metadata: { adminAction: true, nextStatus },
        },
      })
      .catch(() => {});

    return {
      success: true,
      companyId,
      status: nextStatus,
      message: `Organization wallet status updated to ${nextStatus}`,
    };
  }

  @Post('wallets/:companyId/adjust')
  @ApiOperation({
    summary: 'Super Admin manual balance credit / debit adjustment',
  })
  async adjustWalletBalance(
    @Param('companyId') companyId: string,
    @Body() dto: BalanceAdjustmentDto,
  ) {
    if (!dto.amountUsd || dto.amountUsd === 0) {
      throw new BadRequestException(
        'Adjustment amount must be a non-zero number',
      );
    }
    if (!dto.reason) {
      throw new BadRequestException(
        'Admin adjustment reason is required for audit trail',
      );
    }

    const wallet = await this.prisma.organizationWallet.findUnique({
      where: { companyId },
    });

    const currentBalance = wallet ? Number(wallet.balanceUsd) : 100.0;
    const newBalance = currentBalance + dto.amountUsd;

    await this.prisma.organizationWallet.upsert({
      where: { companyId },
      update: { balanceUsd: newBalance },
      create: {
        companyId,
        balanceUsd: newBalance,
        currency: 'USD',
        status: 'ACTIVE',
      },
    });

    const txId = `tx-admin-adj-${Date.now()}`;
    await this.prisma.walletTransaction
      .create({
        data: {
          id: txId,
          companyId,
          type: 'DEPOSIT',
          amountUsd: dto.amountUsd,
          amountUsdc: dto.amountUsd,
          status: 'COMPLETED',
          description: `Super Admin Manual Adjustment: ${dto.reason}`,
        },
      })
      .catch(() => {});

    return {
      success: true,
      companyId,
      adjustmentAmount: dto.amountUsd,
      newBalanceUsd: newBalance,
      reason: dto.reason,
    };
  }
}
