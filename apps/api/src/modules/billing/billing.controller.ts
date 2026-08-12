import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { AuthGuard } from '../auth/auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import * as types from '../../common/interfaces/request.interface';

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  planCode!: string;
}

export class VerifyDto {
  @IsString()
  @IsNotEmpty()
  reference!: string;
}

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Paystack checkout redirect session' })
  async checkout(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: CheckoutDto,
  ) {
    const data = await this.billingService.createCheckoutSession(
      req.user.email,
      dto.planCode,
      req.user.companyId,
    );
    return data;
  }

  @Post('verify')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Paystack transaction reference' })
  async verify(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: VerifyDto,
  ) {
    const success = await this.billingService.verifyPaystackPayment(
      dto.reference,
      req.user.companyId,
    );
    return { success };
  }

  @Post('pay-with-wallet')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pay monthly subscription or token packs using HQ Organization Wallet balance' })
  async payWithWallet(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: CheckoutDto,
  ) {
    const companyId = req.user.companyId || 'c-default';
    return this.billingService.paySubscriptionWithWallet(companyId, dto.planCode);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Paystack Webhooks callback event receiver' })
  async webhook(
    @Body() event: Record<string, unknown>,
    @Headers('x-paystack-signature') signature: string,
    @Req() req: any,
  ) {
    // Prefer rawBody buffer if available for HMAC-SHA512 verification
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    const isValid = this.billingService.verifyPaystackSignature(
      rawBody,
      signature,
    );

    if (!isValid) {
      return { success: false, error: 'Invalid Signature Verification' };
    }

    const eventType = (event?.event as string) || 'charge.success';
    const dataObj = event?.data || {};

    await this.billingService.handleWebhookEvent(eventType, dataObj);
    return { success: true };
  }

  @Get('history')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Retrieve invoice billing history ledger logs' })
  async history(@Req() req: types.AuthenticatedRequest) {
    return this.billingService.getBillingHistory(req.user.companyId);
  }

  @Get('circle/treasury')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Retrieve Circle USDC Agentic Payments treasury status and ledger' })
  async getCircleTreasury(@Req() req: types.AuthenticatedRequest) {
    return this.billingService.getCircleAgenticTreasury(req.user.companyId);
  }

  @Post('circle/execute-payment')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute an autonomous Circle USDC Agentic payment' })
  async executeCirclePayment(
    @Req() req: types.AuthenticatedRequest,
    @Body() body: { amountUsdc: number; vendorName: string; serviceDescription: string; executiveRole?: string },
  ) {
    return this.billingService.executeAgenticUsdcPayment(
      req.user.companyId,
      body.amountUsdc,
      body.vendorName,
      body.serviceDescription,
      body.executiveRole || 'Julian Vance (CFO)',
    );
  }
}
