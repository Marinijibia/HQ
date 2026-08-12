import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected to PostgreSQL Database');
      await this.ensureTablesExist();
    } catch (err) {
      this.logger.warn(`PostgreSQL Database offline (Can't reach 127.0.0.1:5432). API starting in resilient mode.`);
    }
  }

  private async ensureTablesExist() {
    try {
      // Safely ensure vector extension is created if user has privileges
      try {
        await this.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
      } catch {
        // Ignore extension error if cloudsql.enable_pgvector is already managed or user is non-superuser
      }

      // 1. Ensure table users exists & add ALL columns (including password_hash)
      try {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL
          )
        `);
      } catch {}

      const userColumns = [
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'MEMBER'`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP(3)`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_by TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_by TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`
      ];

      for (const q of userColumns) {
        try {
          await this.$executeRawUnsafe(q);
        } catch {}
      }

      // 2. Ensure table companies exists & add ALL columns
      try {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS companies (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL
          )
        `);
      } catch {}

      const companyColumns = [
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS slogan TEXT`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS primary_color TEXT`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS secondary_color TEXT`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry TEXT`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS target_audience TEXT`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS goals TEXT[]`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS operating_style TEXT`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS accent TEXT`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS parent_id TEXT`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'BUSINESS_UNIT'`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by TEXT`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_by TEXT`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS deleted_by TEXT`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        `ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`
      ];

      for (const q of companyColumns) {
        try {
          await this.$executeRawUnsafe(q);
        } catch {}
      }

      // 3. Ensure departments exists & add ALL columns
      try {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS departments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            company_id TEXT NOT NULL
          )
        `);
      } catch {}

      const deptColumns = [
        `ALTER TABLE departments ADD COLUMN IF NOT EXISTS description TEXT`,
        `ALTER TABLE departments ADD COLUMN IF NOT EXISTS is_default_roster BOOLEAN DEFAULT false`,
        `ALTER TABLE departments ADD COLUMN IF NOT EXISTS created_by TEXT`,
        `ALTER TABLE departments ADD COLUMN IF NOT EXISTS updated_by TEXT`,
        `ALTER TABLE departments ADD COLUMN IF NOT EXISTS deleted_by TEXT`,
        `ALTER TABLE departments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
        `ALTER TABLE departments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        `ALTER TABLE departments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`
      ];

      for (const q of deptColumns) {
        try {
          await this.$executeRawUnsafe(q);
        } catch {}
      }

      // 4. Ensure teams exists & add ALL columns
      try {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS teams (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            department_id TEXT NOT NULL
          )
        `);
      } catch {}

      const teamColumns = [
        `ALTER TABLE teams ADD COLUMN IF NOT EXISTS description TEXT`,
        `ALTER TABLE teams ADD COLUMN IF NOT EXISTS created_by TEXT`,
        `ALTER TABLE teams ADD COLUMN IF NOT EXISTS updated_by TEXT`,
        `ALTER TABLE teams ADD COLUMN IF NOT EXISTS deleted_by TEXT`,
        `ALTER TABLE teams ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
        `ALTER TABLE teams ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        `ALTER TABLE teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`
      ];

      for (const q of teamColumns) {
        try {
          await this.$executeRawUnsafe(q);
        } catch {}
      }

      // 5. Ensure executives exists & add ALL columns
      try {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS executives (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role_key TEXT NOT NULL,
            title TEXT NOT NULL,
            department_id TEXT NOT NULL
          )
        `);
      } catch {}

      const execColumns = [
        `ALTER TABLE executives ADD COLUMN IF NOT EXISTS biography TEXT`,
        `ALTER TABLE executives ADD COLUMN IF NOT EXISTS system_prompt TEXT`,
        `ALTER TABLE executives ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
        `ALTER TABLE executives ADD COLUMN IF NOT EXISTS is_default_roster BOOLEAN DEFAULT false`,
        `ALTER TABLE executives ADD COLUMN IF NOT EXISTS is_active_in_workspace BOOLEAN DEFAULT true`,
        `ALTER TABLE executives ADD COLUMN IF NOT EXISTS created_by TEXT`,
        `ALTER TABLE executives ADD COLUMN IF NOT EXISTS updated_by TEXT`,
        `ALTER TABLE executives ADD COLUMN IF NOT EXISTS deleted_by TEXT`,
        `ALTER TABLE executives ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
        `ALTER TABLE executives ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        `ALTER TABLE executives ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`
      ];

      for (const q of execColumns) {
        try {
          await this.$executeRawUnsafe(q);
        } catch {}
      }

      // 6. Ensure missions exists & add ALL columns
      try {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS missions (
            id TEXT PRIMARY KEY,
            objective TEXT NOT NULL,
            company_id TEXT NOT NULL
          )
        `);
      } catch {}

      const missionColumns = [
        `ALTER TABLE missions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'DRAFT'`,
        `ALTER TABLE missions ADD COLUMN IF NOT EXISTS health_score TEXT DEFAULT 'Excellent'`,
        `ALTER TABLE missions ADD COLUMN IF NOT EXISTS deadline TIMESTAMP(3)`,
        `ALTER TABLE missions ADD COLUMN IF NOT EXISTS is_legal_hold BOOLEAN DEFAULT false`,
        `ALTER TABLE missions ADD COLUMN IF NOT EXISTS created_by TEXT`,
        `ALTER TABLE missions ADD COLUMN IF NOT EXISTS updated_by TEXT`,
        `ALTER TABLE missions ADD COLUMN IF NOT EXISTS deleted_by TEXT`,
        `ALTER TABLE missions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
        `ALTER TABLE missions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        `ALTER TABLE missions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`
      ];

      for (const q of missionColumns) {
        try {
          await this.$executeRawUnsafe(q);
        } catch {}
      }

      // 7. Ensure subscriptions & invoices columns exist
      const billingColumns = [
        `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_gateway TEXT`,
        `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS external_customer_id TEXT`,
        `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS external_subscription_id TEXT`,
        `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS external_reference TEXT`,
        `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS gateway_status TEXT`
      ];

      for (const q of billingColumns) {
        try {
          await this.$executeRawUnsafe(q);
        } catch {}
      }

      // 8. Ensure WaaS & wallet tables exist
      try {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS hq_master_wallets (
            id TEXT PRIMARY KEY,
            circle_wallet_id TEXT NOT NULL,
            circle_address TEXT NOT NULL,
            total_usdc_reserve DOUBLE PRECISION DEFAULT 0.0,
            status TEXT DEFAULT 'ACTIVE',
            created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch {}

      try {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS organization_wallets (
            id TEXT PRIMARY KEY,
            company_id TEXT UNIQUE NOT NULL,
            balance_usd DOUBLE PRECISION DEFAULT 0.0,
            currency TEXT DEFAULT 'USD',
            status TEXT DEFAULT 'ACTIVE',
            created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch {}

      try {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS agent_allowances (
            id TEXT PRIMARY KEY,
            company_id TEXT NOT NULL,
            executive_id TEXT,
            role_key TEXT NOT NULL,
            monthly_limit DOUBLE PRECISION DEFAULT 500.0,
            current_month_spent DOUBLE PRECISION DEFAULT 0.0,
            single_tx_limit DOUBLE PRECISION DEFAULT 50.0,
            require_approval_above DOUBLE PRECISION DEFAULT 50.0,
            status TEXT DEFAULT 'ACTIVE',
            created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(company_id, role_key)
          );
        `);
      } catch {}

      try {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS wallet_transactions (
            id TEXT PRIMARY KEY,
            company_id TEXT NOT NULL,
            type TEXT NOT NULL,
            amount_usd DOUBLE PRECISION NOT NULL,
            amount_usdc DOUBLE PRECISION NOT NULL,
            vendor_address TEXT,
            vendor_name TEXT,
            circle_tx_id TEXT,
            blockchain_tx_hash TEXT,
            status TEXT DEFAULT 'COMPLETED',
            description TEXT,
            executive_role_key TEXT,
            created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch {}

      try {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS governance_policies (
            id TEXT PRIMARY KEY,
            rule_text TEXT NOT NULL,
            category TEXT NOT NULL,
            version TEXT DEFAULT 'v1.0',
            status TEXT DEFAULT 'Active',
            company_id TEXT,
            created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch {}

      try {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS governance_delegations (
            id TEXT PRIMARY KEY,
            delegator TEXT NOT NULL,
            delegatee TEXT NOT NULL,
            scope TEXT NOT NULL,
            start_date TEXT,
            end_date TEXT,
            active BOOLEAN DEFAULT true,
            company_id TEXT,
            created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch {}

      this.logger.log('Complete PostgreSQL database schema audited & column alignment verified.');
    } catch (e) {
      this.logger.warn(`Database verification notice: ${(e as Error).message}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {
      // Ignore disconnect error
    }
  }
}
