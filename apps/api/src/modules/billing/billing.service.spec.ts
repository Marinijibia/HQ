import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { PrismaService } from '../database/prisma.service';

describe('BillingService', () => {
  let service: BillingService;
  let prisma: PrismaService;

  const mockPrisma = {
    $transaction: jest.fn((callback) => callback(mockPrisma)),
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 'log-101' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('should return a mock Stripe checkout URL containing session id', async () => {
      const companyId = '7b18dfa8-7fba-4b77-8fa8-fb18dfa87fba';
      const planCode = 'growth';
      const result = await service.createCheckoutSession(companyId, planCode);

      expect(result).toContain('https://checkout.stripe.com/pay/cs_test_');
    });
  });

  describe('handleWebhookEvent', () => {
    it('should process customer.subscription.created and log audit entry', async () => {
      const eventType = 'customer.subscription.created';
      const eventData = {
        planCode: 'growth',
        metadata: {
          companyId: '7b18dfa8-7fba-4b77-8fa8-fb18dfa87fba',
        },
      };

      await service.handleWebhookEvent(eventType, eventData);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          companyId: '7b18dfa8-7fba-4b77-8fa8-fb18dfa87fba',
          eventType: 'billing.customer_subscription_created',
          metadata: {
            stripeEvent: 'customer.subscription.created',
            details: eventData,
          },
        },
      });
    });
  });

  describe('getBillingHistory', () => {
    it('should return a list of past invoices details', async () => {
      const companyId = '7b18dfa8-7fba-4b77-8fa8-fb18dfa87fba';
      const result = await service.getBillingHistory(companyId);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('amount', 4900);
      expect(result[0]).toHaveProperty('status', 'Paid');
    });
  });
});
