import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
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

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Stripe checkout redirect session' })
  async checkout(
    @Req() req: types.AuthenticatedRequest,
    @Body() dto: CheckoutDto,
  ) {
    const url = await this.billingService.createCheckoutSession(
      req.user.companyId,
      dto.planCode,
    );
    return { url };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe Webhooks callback event receiver' })
  async webhook(@Body() event: Record<string, unknown>) {
    const eventType =
      (event?.type as string) || 'customer.subscription.updated';
    const dataObj = (event?.data as Record<string, unknown>)?.object || {};
    await this.billingService.handleWebhookEvent(
      eventType,
      dataObj as Record<string, unknown>,
    );
    return { success: true };
  }

  @Get('history')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Retrieve invoice billing history ledger logs' })
  async history(@Req() req: types.AuthenticatedRequest) {
    return this.billingService.getBillingHistory(req.user.companyId);
  }
}
