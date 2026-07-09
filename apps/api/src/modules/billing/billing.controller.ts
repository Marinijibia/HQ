import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { AuthGuard } from '../auth/auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

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
  async checkout(@Body() dto: CheckoutDto) {
    const companyId = '7b18dfa8-7fba-4b77-8fa8-fb18dfa87fba'; // stub default
    const url = await this.billingService.createCheckoutSession(
      companyId,
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
  async history() {
    const companyId = '7b18dfa8-7fba-4b77-8fa8-fb18dfa87fba';
    return this.billingService.getBillingHistory(companyId);
  }
}
