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
  @ApiOperation({ summary: 'Get global Treasury KPIs, system liabilities, and revenue volume for Super Admin' })
  async getGlobalStats() {
    // 1. Fetch Master Circle Reserve
    const masterVault = await this.circleClient.getMasterWalletReserve();

    // 2. Fetch total Virtual USD Liabilities across all companies
    const orgWallets: any[] = ((await this.prisma.$queryRawUnsafe(`
      SELECT SUM(balance_usd) as total_usd, COUNT(id) as wallet_count FROM organization_wallets
    `).catch(() => [])) as any[]) || [];

    const totalSystemUsdLiabilities = orgWallets.length > 0 && orgWallets[0].total_usd
      ? parseFloat(orgWallets[0].total_usd)
      : 0.0;
    const totalOrgWalletsCount = orgWallets.length > 0 && orgWallets[0].wallet_count
      ? parseInt(orgWallets[0].wallet_count, 10)
      : 0;

    // 3. Fetch Gross Processed Volume & Total Transactions
    const txStats: any[] = ((await this.prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(id) as total_txs,
        SUM(amount_usd) as gross_volume_usd,
        SUM(CASE WHEN type = 'DEPOSIT' THEN amount_usd ELSE 0 END) as deposit_volume,
        SUM(CASE WHEN type = 'SUBSCRIPTION_PAYMENT' THEN amount_usd ELSE 0 END) as subscription_volume,
        SUM(CASE WHEN type = 'AGENT_PAYMENT' THEN amount_usd ELSE 0 END) as agent_autonomous_volume
      FROM wallet_transactions
    `).catch(() => [])) as any[]) || [];

    const s = txStats[0] || {};
    const totalTransactions = parseInt(s.total_txs || '0', 10);
    const grossVolumeUsd = parseFloat(s.gross_volume_usd || '0');
    const depositVolume = parseFloat(s.deposit_volume || '0');
    const subscriptionVolume = parseFloat(s.subscription_volume || '0');
    const agentAutonomousVolume = parseFloat(s.agent_autonomous_volume || '0');

    // 4. Fetch Subscriptions Count Breakdown
    const activeSubCount = await this.prisma.subscription.count({ where: { status: 'ACTIVE' } }).catch(() => 0);
    const pastDueSubCount = await this.prisma.subscription.count({ where: { status: 'PAST_DUE' } }).catch(() => 0);

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
  @ApiOperation({ summary: 'Master real-time audit feed of ALL system transactions across all organizations' })
  async getAllTransactions(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('limit') limitStr = '100',
  ) {
    const limit = parseInt(limitStr, 10) || 100;
    let whereClause = `WHERE 1=1`;

    if (type) {
      whereClause += ` AND type = '${type.toUpperCase()}'`;
    }
    if (status) {
      whereClause += ` AND status = '${status.toUpperCase()}'`;
    }
    if (search) {
      const cleanSearch = search.replace(/'/g, "''");
      whereClause += ` AND (vendor_name ILIKE '%${cleanSearch}%' OR description ILIKE '%${cleanSearch}%' OR circle_tx_id ILIKE '%${cleanSearch}%' OR company_id ILIKE '%${cleanSearch}%')`;
    }

    const rows: any[] = ((await this.prisma.$queryRawUnsafe(`
      SELECT wt.*, c.name as company_name, c.slug as company_slug
      FROM wallet_transactions wt
      LEFT JOIN companies c ON wt.company_id = c.id
      ${whereClause}
      ORDER BY wt.created_at DESC
      LIMIT ${limit}
    `).catch(() => [])) as any[]) || [];

    return rows.map((r) => ({
      id: r.id,
      companyId: r.company_id,
      companyName: r.company_name || 'Organization Workspace',
      type: r.type,
      amountUsd: parseFloat(r.amount_usd || '0'),
      amountUsdc: parseFloat(r.amount_usdc || '0'),
      vendorAddress: r.vendor_address,
      vendorName: r.vendor_name || 'System / Provider',
      circleTxId: r.circle_tx_id,
      blockchainTxHash: r.blockchain_tx_hash,
      status: r.status,
      description: r.description,
      executiveRoleKey: r.executive_role_key,
      createdAt: r.created_at,
    }));
  }

  @Get('wallets')
  @ApiOperation({ summary: 'List all customer organization wallets and assigned AI Executive allowances' })
  async getAllWallets() {
    const rows: any[] = ((await this.prisma.$queryRawUnsafe(`
      SELECT ow.*, c.name as company_name, c.slug as company_slug
      FROM organization_wallets ow
      LEFT JOIN companies c ON ow.company_id = c.id
      ORDER BY ow.created_at DESC
    `).catch(() => [])) as any[]) || [];

    const walletsWithAllowances = await Promise.all(
      rows.map(async (r) => {
        const allowances: any[] = ((await this.prisma.$queryRawUnsafe(`
          SELECT * FROM agent_allowances WHERE company_id = '${r.company_id}'
        `).catch(() => [])) as any[]) || [];

        return {
          id: r.id,
          companyId: r.company_id,
          companyName: r.company_name || 'Organization Workspace',
          companySlug: r.company_slug,
          balanceUsd: parseFloat(r.balance_usd || '0'),
          currency: r.currency || 'USD',
          status: r.status || 'ACTIVE',
          updatedAt: r.updated_at,
          allowances: allowances.map((a) => ({
            roleKey: a.role_key,
            monthlyLimit: parseFloat(a.monthly_limit || '500'),
            currentMonthSpent: parseFloat(a.current_month_spent || '0'),
            singleTxLimit: parseFloat(a.single_tx_limit || '50'),
            requireApprovalAbove: parseFloat(a.require_approval_above || '50'),
          })),
        };
      }),
    );

    return walletsWithAllowances;
  }

  @Post('wallets/:companyId/freeze')
  @ApiOperation({ summary: 'Emergency Freeze / Unfreeze an organization wallet' })
  async toggleWalletFreeze(@Param('companyId') companyId: string) {
    const rows: any[] = ((await this.prisma.$queryRawUnsafe(`
      SELECT id, status FROM organization_wallets WHERE company_id = '${companyId}' LIMIT 1
    `).catch(() => [])) as any[]) || [];

    const currentStatus = rows.length > 0 ? rows[0].status : 'ACTIVE';
    const nextStatus = currentStatus === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';

    await this.prisma.$executeRawUnsafe(`
      UPDATE organization_wallets SET status = '${nextStatus}', updated_at = NOW() WHERE company_id = '${companyId}'
    `).catch(() => {});

    // Log admin audit event
    await this.prisma.auditLog.create({
      data: {
        companyId,
        eventType: nextStatus === 'FROZEN' ? 'admin.wallet_frozen' : 'admin.wallet_unfrozen',
        metadata: { adminAction: true, nextStatus },
      },
    }).catch(() => {});

    return {
      success: true,
      companyId,
      status: nextStatus,
      message: `Organization wallet status updated to: ${nextStatus}`,
    };
  }

  @Post('wallets/:companyId/adjust')
  @ApiOperation({ summary: 'Super Admin manual balance credit / debit adjustment' })
  async adjustWalletBalance(
    @Param('companyId') companyId: string,
    @Body() dto: BalanceAdjustmentDto,
  ) {
    if (!dto.amountUsd || dto.amountUsd === 0) {
      throw new BadRequestException('Adjustment amount must be a non-zero number');
    }
    if (!dto.reason) {
      throw new BadRequestException('Admin adjustment reason is required for audit trail');
    }

    const rows: any[] = ((await this.prisma.$queryRawUnsafe(`
      SELECT id, balance_usd FROM organization_wallets WHERE company_id = '${companyId}' LIMIT 1
    `).catch(() => [])) as any[]) || [];

    const currentBalance = rows.length > 0 ? parseFloat(rows[0].balance_usd || '0') : 100.0;
    const newBalance = currentBalance + dto.amountUsd;

    await this.prisma.$executeRawUnsafe(`
      UPDATE organization_wallets SET balance_usd = ${newBalance}, updated_at = NOW() WHERE company_id = '${companyId}'
    `).catch(() => {});

    const txId = `tx-admin-adj-${Date.now()}`;
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO wallet_transactions (id, company_id, type, amount_usd, amount_usdc, status, description, created_at, updated_at)
      VALUES ('${txId}', '${companyId}', 'DEPOSIT', ${dto.amountUsd}, ${dto.amountUsd}, 'COMPLETED', 'Super Admin Manual Adjustment: ${dto.reason.replace(/'/g, "''")}', NOW(), NOW())
    `).catch(() => {});

    return {
      success: true,
      companyId,
      adjustmentAmount: dto.amountUsd,
      newBalanceUsd: newBalance,
      reason: dto.reason,
    };
  }
}
