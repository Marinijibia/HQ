import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { WalletService, ExecuteAgentPaymentDto } from './wallet.service';
import { AuthGuard } from '../auth/auth.guard';
import * as types from '../../common/interfaces/request.interface';

export class DepositDto {
  @IsNumber()
  @Min(0.01)
  amountUsd!: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateAllowanceDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyLimit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  singleTxLimit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  requireApprovalAbove?: number;
}

import { RolesGuard } from '../auth/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current organization HQ Wallet balance' })
  async getWallet(@Req() req: types.AuthenticatedRequest) {
    const companyId = req.user.companyId || req.user.uid;
    return this.walletService.getWallet(companyId);
  }

  @Post('deposit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMINISTRATOR)
  @ApiOperation({
    summary: 'Deposit fiat funds into virtual HQ Organization Wallet (Super Admin Only)',
  })
  async deposit(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: DepositDto,
  ) {
    const companyId = req.user.companyId || req.user.uid;
    return this.walletService.deposit(
      companyId,
      dto.amountUsd,
      dto.description,
    );
  }

  @Get('allowances')
  @ApiOperation({ summary: 'Get AI Executive spending allowances' })
  async getAllowances(@Req() req: types.AuthenticatedRequest) {
    const companyId = req.user.companyId || req.user.uid;
    return this.walletService.getAgentAllowances(companyId);
  }

  @Patch('allowances/:roleKey')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({
    summary: 'Update spending allowance for a specific AI Executive',
  })
  async updateAllowance(
    @Req() req: types.AuthenticatedRequest,
    @Param('roleKey') roleKey: string,
    @Body() dto: UpdateAllowanceDto,
  ) {
    const companyId = req.user.companyId || req.user.uid;
    return this.walletService.updateAgentAllowance(companyId, roleKey, dto);
  }

  @Post('agent-payment')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({
    summary: 'Execute autonomous AI Executive payment via Circle USDC',
  })
  async executeAgentPayment(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: ExecuteAgentPaymentDto,
  ) {
    const companyId = req.user.companyId || req.user.uid;
    return this.walletService.executeAutonomousAgentPayment(companyId, dto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction audit history for HQ Wallet' })
  async getTransactions(@Req() req: types.AuthenticatedRequest) {
    const companyId = req.user.companyId || req.user.uid;
    return this.walletService.getTransactions(companyId);
  }
}
