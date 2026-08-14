import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';

describe('BillingService', () => {
  let service: BillingService;

  const mockPrisma: Partial<Record<string, any>> = {
    subscription: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({ id: 'sub-001', status: 'ACTIVE' }),
    },
    organizationWallet: {
      findUnique: jest.fn().mockResolvedValue({ companyId: 'comp-001', balanceUsd: 100 }),
      update: jest.fn().mockResolvedValue({}),
    },
    walletTransaction: {
      create: jest.fn().mockResolvedValue({ id: 'tx-001' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    plan: {
      findFirst: jest.fn().mockResolvedValue({ id: 'plan-001', code: 'growth' }),
    },
    company: {
      update: jest.fn().mockResolvedValue({}),
    },
    $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
  };

  const mockEmailService: Partial<Record<string, any>> = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('should return a simulated checkout reference in dev mode (no PAYSTACK_SECRET_KEY)', async () => {
      // Ensure we are not in production mode for this test
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      const email = 'test@example.com';
      const planCode = 'growth';
      const companyId = '7b18dfa8-7fba-4b77-8fa8-fb18dfa87fba';
      const result = await service.createCheckoutSession(email, planCode, companyId);

      expect(result).toHaveProperty('reference');
      expect(result.reference).toMatch(/^pay_mock_/);

      process.env.NODE_ENV = origEnv;
    });
  });

  describe('getBillingHistory', () => {
    it('should return an array of billing history entries', async () => {
      const companyId = '7b18dfa8-7fba-4b77-8fa8-fb18dfa87fba';
      const result = await service.getBillingHistory(companyId);

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
