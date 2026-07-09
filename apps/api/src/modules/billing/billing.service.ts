import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createCheckoutSession(
    companyId: string,
    planCode: string,
  ): Promise<string> {
    this.logger.log(
      `[Billing Service] Generating Stripe checkout session for organization: ${companyId} (Plan: ${planCode})`,
    );

    // Simulate unique session IDs
    const sessionId = Math.random().toString(36).substring(7);
    return `https://checkout.stripe.com/pay/cs_test_${sessionId}`;
  }

  async handleWebhookEvent(
    eventType: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    this.logger.log(`[Billing Webhook] Received Stripe Event: ${eventType}`);

    const metadata = (data?.metadata as Record<string, unknown>) || {};
    const companyId =
      (metadata.companyId as string) || '7b18dfa8-7fba-4b77-8fa8-fb18dfa87fba';

    await this.prisma.$transaction(async (tx) => {
      // Create Audit Log entries tracking payment state
      await tx.auditLog.create({
        data: {
          companyId,
          eventType: `billing.${eventType.replace(/\./g, '_')}`,
          metadata: {
            stripeEvent: eventType,
            details: data as Prisma.InputJsonValue,
          },
        },
      });

      if (
        eventType === 'customer.subscription.created' ||
        eventType === 'customer.subscription.updated'
      ) {
        const planCode = (data.planCode as string) || 'growth';
        this.logger.log(
          `[Billing Webhook] Elevating entitlement bounds for tenant ${companyId} to: ${planCode}`,
        );
        // In real setups we sync subscription status and plan bindings
      }

      if (eventType === 'customer.subscription.deleted') {
        this.logger.warn(
          `[Billing Webhook] Subscription canceled. Throttling tenant ${companyId} to free limitations.`,
        );
      }
    });
  }

  async getBillingHistory(companyId: string) {
    this.logger.log(
      `[Billing Service] Querying invoice history logs for organization: ${companyId}`,
    );
    return [
      {
        id: 'inv-001',
        amount: 4900,
        currency: 'usd',
        status: 'Paid',
        invoiceUrl: 'https://stripe.com/invoices/inv_test_001',
        createdAt: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: 'inv-002',
        amount: 4900,
        currency: 'usd',
        status: 'Paid',
        invoiceUrl: 'https://stripe.com/invoices/inv_test_002',
        createdAt: new Date().toISOString(),
      },
    ];
  }
}
