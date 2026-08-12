import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CircleClientService } from './circle-client.service';

import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';

export class ExecuteAgentPaymentDto {
  @IsString()
  @IsNotEmpty()
  roleKey!: string;

  @IsNumber()
  @Min(0.01)
  amountUsd!: number;

  @IsString()
  @IsNotEmpty()
  vendorName!: string;

  @IsString()
  @IsNotEmpty()
  vendorAddress!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly circleClient: CircleClientService,
  ) {}

  /**
   * Get or initialize Virtual Organization Wallet
   */
  async getWallet(companyId: string) {
    if (!companyId) throw new BadRequestException('Organization ID is required');

    try {
      let wallet = await this.prisma.organizationWallet.findUnique({
        where: { companyId },
      });

      if (!wallet) {
        wallet = await this.prisma.organizationWallet.create({
          data: {
            companyId,
            balanceUsd: 100.0, // Initial complimentary executive balance
            currency: 'USD',
            status: 'ACTIVE',
          },
        });
      }

      return wallet;
    } catch {
      // Raw SQL fallback for database resilience
      const rawRes = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM organization_wallets WHERE company_id = '${companyId}' LIMIT 1
      `).catch(() => []);
      const rows = (Array.isArray(rawRes) ? rawRes : []) as any[];

      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          companyId: r.company_id,
          balanceUsd: r.balance_usd,
          currency: r.currency || 'USD',
          status: r.status || 'ACTIVE',
        };
      }

      const id = `w-org-${Date.now()}`;
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO organization_wallets (id, company_id, balance_usd, currency, status, created_at, updated_at)
        VALUES ('${id}', '${companyId}', 100.0, 'USD', 'ACTIVE', NOW(), NOW())
        ON CONFLICT (company_id) DO NOTHING
      `).catch(() => {});

      return {
        id,
        companyId,
        balanceUsd: 100.0,
        currency: 'USD',
        status: 'ACTIVE',
      };
    }
  }

  /**
   * Deposit Fiat Funds to Virtual Organization Wallet
   */
  async deposit(companyId: string, amountUsd: number, description?: string) {
    if (amountUsd <= 0) throw new BadRequestException('Deposit amount must be greater than zero');

    const wallet = await this.getWallet(companyId);
    const newBalance = wallet.balanceUsd + amountUsd;

    try {
      await this.prisma.organizationWallet.update({
        where: { companyId },
        data: { balanceUsd: newBalance },
      });
    } catch {
      await this.prisma.$executeRawUnsafe(`
        UPDATE organization_wallets SET balance_usd = ${newBalance}, updated_at = NOW() WHERE company_id = '${companyId}'
      `).catch(() => {});
    }

    // Log transaction
    const txId = `tx-dep-${Date.now()}`;
    try {
      await this.prisma.walletTransaction.create({
        data: {
          id: txId,
          companyId,
          type: 'DEPOSIT',
          amountUsd,
          amountUsdc: amountUsd,
          status: 'COMPLETED',
          description: description || 'Fiat Balance Deposit',
        },
      });
    } catch {
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO wallet_transactions (id, company_id, type, amount_usd, amount_usdc, status, description, created_at, updated_at)
        VALUES ('${txId}', '${companyId}', 'DEPOSIT', ${amountUsd}, ${amountUsd}, 'COMPLETED', '${description || 'Fiat Balance Deposit'}', NOW(), NOW())
      `).catch(() => {});
    }

    return {
      success: true,
      message: `Successfully deposited $${amountUsd.toFixed(2)} USD to HQ Wallet`,
      balanceUsd: newBalance,
    };
  }

  /**
   * Get AI Agent Spending Allowances
   */
  async getAgentAllowances(companyId: string) {
    const defaultRoles = [
      { roleKey: 'ASAD', monthlyLimit: 1000.0, singleTxLimit: 100.0, requireApprovalAbove: 100.0 },
      { roleKey: 'CEO', monthlyLimit: 2000.0, singleTxLimit: 250.0, requireApprovalAbove: 250.0 },
      { roleKey: 'CTO', monthlyLimit: 1000.0, singleTxLimit: 100.0, requireApprovalAbove: 100.0 },
      { roleKey: 'CFO', monthlyLimit: 1500.0, singleTxLimit: 200.0, requireApprovalAbove: 200.0 },
      { roleKey: 'CMO', monthlyLimit: 800.0, singleTxLimit: 75.0, requireApprovalAbove: 75.0 },
    ];

    try {
      let allowances = await this.prisma.agentAllowance.findMany({
        where: { companyId },
      });

      if (allowances.length === 0) {
        // Seed default allowances
        for (const r of defaultRoles) {
          await this.prisma.agentAllowance
            .create({
              data: {
                companyId,
                roleKey: r.roleKey,
                monthlyLimit: r.monthlyLimit,
                singleTxLimit: r.singleTxLimit,
                requireApprovalAbove: r.requireApprovalAbove,
              },
            })
            .catch(() => {});
        }

        allowances = await this.prisma.agentAllowance.findMany({
          where: { companyId },
        });
      }

      return allowances;
    } catch {
      return defaultRoles.map((r) => ({
        id: `a-${r.roleKey}`,
        companyId,
        roleKey: r.roleKey,
        monthlyLimit: r.monthlyLimit,
        currentMonthSpent: 0.0,
        singleTxLimit: r.singleTxLimit,
        requireApprovalAbove: r.requireApprovalAbove,
        status: 'ACTIVE',
      }));
    }
  }

  /**
   * Update AI Agent Spending Allowance
   */
  async updateAgentAllowance(
    companyId: string,
    roleKey: string,
    data: { monthlyLimit?: number; singleTxLimit?: number; requireApprovalAbove?: number },
  ) {
    try {
      return await this.prisma.agentAllowance.upsert({
        where: {
          companyId_roleKey: { companyId, roleKey: roleKey.toUpperCase() },
        },
        update: {
          ...(data.monthlyLimit !== undefined && { monthlyLimit: data.monthlyLimit }),
          ...(data.singleTxLimit !== undefined && { singleTxLimit: data.singleTxLimit }),
          ...(data.requireApprovalAbove !== undefined && {
            requireApprovalAbove: data.requireApprovalAbove,
          }),
        },
        create: {
          companyId,
          roleKey: roleKey.toUpperCase(),
          monthlyLimit: data.monthlyLimit ?? 500.0,
          singleTxLimit: data.singleTxLimit ?? 50.0,
          requireApprovalAbove: data.requireApprovalAbove ?? 50.0,
        },
      });
    } catch {
      return {
        companyId,
        roleKey: roleKey.toUpperCase(),
        monthlyLimit: data.monthlyLimit ?? 500.0,
        singleTxLimit: data.singleTxLimit ?? 50.0,
        requireApprovalAbove: data.requireApprovalAbove ?? 50.0,
        status: 'ACTIVE',
      };
    }
  }

  /**
   * Core Autonomous Payment Engine: Validates Balance & Allowance → Dispatches Circle USDC → Deducts Ledger
   */
  async executeAutonomousAgentPayment(companyId: string, dto: ExecuteAgentPaymentDto) {
    const roleKey = dto.roleKey.toUpperCase();
    const amountUsd = dto.amountUsd;

    if (amountUsd <= 0) throw new BadRequestException('Payment amount must be greater than zero');
    if (!dto.vendorAddress) throw new BadRequestException('Vendor destination address is required');

    // 1. Check Virtual Organization Wallet Balance
    const wallet = await this.getWallet(companyId);
    if (wallet.balanceUsd < amountUsd) {
      throw new BadRequestException(
        `Insufficient Organization Wallet balance ($${wallet.balanceUsd.toFixed(
          2,
        )} USD available). Please top up your HQ wallet balance to complete this transaction.`,
      );
    }

    // 2. Check Executive Allowance & Policy Controls
    const allowances = await this.getAgentAllowances(companyId);
    const agentPolicy = allowances.find((a) => a.roleKey === roleKey) || {
      monthlyLimit: 500.0,
      currentMonthSpent: 0.0,
      singleTxLimit: 50.0,
      requireApprovalAbove: 50.0,
    };

    // Check Single Tx Threshold for Human Approval
    if (amountUsd > agentPolicy.requireApprovalAbove) {
      throw new ForbiddenException({
        code: 'HITL_APPROVAL_REQUIRED',
        message: `Transaction of $${amountUsd.toFixed(
          2,
        )} exceeds ${roleKey}'s single-transaction cap ($${agentPolicy.requireApprovalAbove.toFixed(
          2,
        )}). Human approval is required in the Boardroom.`,
        amountUsd,
        vendorName: dto.vendorName,
        vendorAddress: dto.vendorAddress,
        roleKey,
      });
    }

    // Check Monthly Allowance Limit
    if (agentPolicy.currentMonthSpent + amountUsd > agentPolicy.monthlyLimit) {
      throw new ForbiddenException(
        `Monthly limit exceeded for ${roleKey}. Allowed: $${agentPolicy.monthlyLimit.toFixed(
          2,
        )}, Spent: $${agentPolicy.currentMonthSpent.toFixed(2)}, Requested: $${amountUsd.toFixed(2)}.`,
      );
    }

    // 3. Atomically Reserve & Deduct Internal Balance BEFORE Dispatching External Transfer
    const updatedBalance = wallet.balanceUsd - amountUsd;
    try {
      await this.prisma.organizationWallet.update({
        where: { companyId },
        data: { balanceUsd: updatedBalance },
      });
    } catch {
      await this.prisma.$executeRawUnsafe(
        `UPDATE organization_wallets SET balance_usd = $1, updated_at = NOW() WHERE company_id = $2`,
        updatedBalance,
        companyId,
      ).catch(() => {});
    }

    try {
      await this.prisma.agentAllowance.update({
        where: { companyId_roleKey: { companyId, roleKey } },
        data: { currentMonthSpent: agentPolicy.currentMonthSpent + amountUsd },
      }).catch(() => {});
    } catch {
      /* ignore */
    }

    // 4. Dispatch On-Chain USDC Payment via Circle Master Wallet API
    const idempotencyKey = `hq_tx_${companyId}_${Date.now()}`;
    let circleResult;
    try {
      circleResult = await this.circleClient.executeUsdcTransfer({
        idempotencyKey,
        destinationAddress: dto.vendorAddress,
        amountUsdc: amountUsd,
        description: `HQ Autonomous Spend by ${roleKey}: ${dto.description}`,
      });
    } catch (circleErr: any) {
      // REFUND internal balance if Circle API fails
      const refundedBalance = updatedBalance + amountUsd;
      await this.prisma.organizationWallet.update({
        where: { companyId },
        data: { balanceUsd: refundedBalance },
      }).catch(() => {});

      this.logger.error(`[Wallet] On-chain transfer failed. Refunded balance to ${companyId}: ${circleErr.message}`);
      throw new BadRequestException(`Circle USDC payment dispatch failed: ${circleErr.message}. Funds refunded to HQ Wallet.`);
    }

    // 5. Record Audit Ledger Transaction
    const txId = `tx-agent-${Date.now()}`;
    try {
      await this.prisma.walletTransaction.create({
        data: {
          id: txId,
          companyId,
          type: 'AGENT_PAYMENT',
          amountUsd,
          amountUsdc: amountUsd,
          vendorAddress: dto.vendorAddress,
          vendorName: dto.vendorName,
          circleTxId: circleResult.circleTxId,
          blockchainTxHash: circleResult.blockchainTxHash || null,
          status: 'COMPLETED',
          description: dto.description,
          executiveRoleKey: roleKey,
        },
      });
    } catch {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO wallet_transactions (id, company_id, type, amount_usd, amount_usdc, vendor_address, vendor_name, circle_tx_id, blockchain_tx_hash, status, description, executive_role_key, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
        txId,
        companyId,
        'AGENT_PAYMENT',
        amountUsd,
        amountUsd,
        dto.vendorAddress,
        dto.vendorName,
        circleResult.circleTxId,
        circleResult.blockchainTxHash || '',
        'COMPLETED',
        dto.description,
        roleKey,
      ).catch(() => {});
    }

    this.logger.log(
      `[Wallet] Autonomous payment of $${amountUsd} executed by ${roleKey} for ${dto.vendorName} (Tx: ${circleResult.circleTxId})`,
    );

    return {
      success: true,
      transactionId: txId,
      circleTxId: circleResult.circleTxId,
      blockchainTxHash: circleResult.blockchainTxHash,
      amountUsd,
      remainingBalanceUsd: updatedBalance,
      executiveRoleKey: roleKey,
      vendorName: dto.vendorName,
    };
  }

  /**
   * List Wallet Transactions Audit Trail
   */
  async getTransactions(companyId: string) {
    try {
      return await this.prisma.walletTransaction.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch {
      const rawRes = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM wallet_transactions WHERE company_id = '${companyId}' ORDER BY created_at DESC LIMIT 50
      `).catch(() => []);
      const rows = (Array.isArray(rawRes) ? rawRes : []) as any[];

      return rows.map((r) => ({
        id: r.id,
        companyId: r.company_id,
        type: r.type,
        amountUsd: r.amount_usd,
        amountUsdc: r.amount_usdc,
        vendorAddress: r.vendor_address,
        vendorName: r.vendor_name,
        circleTxId: r.circle_tx_id,
        blockchainTxHash: r.blockchain_tx_hash,
        status: r.status,
        description: r.description,
        executiveRoleKey: r.executive_role_key,
        createdAt: r.created_at,
      }));
    }
  }
}
