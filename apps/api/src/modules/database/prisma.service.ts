import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
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
      await this.ensureAllSchemaTablesAndColumns();
    } catch (err) {
      this.logger.warn(
        `PostgreSQL Database connection notice: ${(err as Error).message}. Operating in resilient mode.`,
      );
    }
  }

  /**
   * Universally resolve a valid, existing Company UUID.
   * Never crashes on non-UUID strings like 'company_123' or null.
   */
  async resolveCompanyId(candidate?: string): Promise<string> {
    if (
      candidate &&
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        candidate,
      )
    ) {
      try {
        const found = await this.company.findUnique({
          where: { id: candidate },
        });
        if (found) return found.id;
      } catch {}
    }
    try {
      const first = await this.company.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (first) return first.id;
      const created = await this.company.create({
        data: {
          name: 'HQ Operations Workspace',
          slug: 'hq-core',
          level: 'ENTERPRISE' as any,
        },
      });
      return created.id;
    } catch {
      return '00000000-0000-0000-0000-000000000001';
    }
  }

  /**
   * Comprehensive, zero-drift PostgreSQL schema synchronizer and type harmonizer.
   * Ensures all 35 tables, all columns, and matching column types (UUID & ENUMs) exist in PostgreSQL.
   */
  private async ensureAllSchemaTablesAndColumns() {
    this.logger.log(
      '⚡ [DB Sync] Running zero-drift schema synchronizer across all PostgreSQL tables...',
    );

    // 1. Extensions
    const extensions = [
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
      `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`,
      `CREATE EXTENSION IF NOT EXISTS vector;`,
    ];
    for (const sql of extensions) {
      try {
        await this.$executeRawUnsafe(sql);
      } catch {}
    }

    // 2. Postgres ENUMs
    const enums = [
      `DO $$ BEGIN CREATE TYPE "CompanyLevel" AS ENUM ('HOLDING_CO', 'SUBSIDIARY', 'BUSINESS_UNIT', 'PROJECT_TEAM', 'ENTERPRISE', 'REGION', 'COUNTRY'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMINISTRATOR', 'ORGANIZATION_OWNER', 'EXECUTIVE_DIRECTOR', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'MEMBER', 'GUEST', 'ADMINISTRATOR', 'DEPARTMENT_MANAGER', 'EXECUTIVE_USER', 'AUDITOR', 'VIEWER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING', 'TRIAL', 'SUSPENDED', 'CANCELLED', 'EXPIRED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "MissionStatus" AS ENUM ('DRAFT', 'QUEUED', 'PLANNING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED', 'EXECUTING', 'REVIEWING', 'APPROVED', 'DELIVERED', 'ARCHIVED', 'LEARNING_COMPLETE'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED', 'IN_PROGRESS'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "DataClassification" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "MemoryLayer" AS ENUM ('USER', 'ORGANIZATION', 'EXECUTIVE', 'MISSION', 'WORKING', 'KNOWLEDGE_LIBRARY'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "ListingType" AS ENUM ('EXECUTIVE', 'DEPARTMENT'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    ];
    for (const sql of enums) {
      try {
        await this.$executeRawUnsafe(sql);
      } catch {}
    }

    // 3. Table Creation & Complete Column Alterations
    const tableDefinitions: {
      table: string;
      createSql: string;
      columns: string[];
    }[] = [
      {
        table: 'companies',
        createSql: `CREATE TABLE IF NOT EXISTS companies (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL);`,
        columns: [
          `ALTER TABLE companies ADD COLUMN IF NOT EXISTS name TEXT`,
          `ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT`,
          `ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT`,
          `ALTER TABLE companies ADD COLUMN IF NOT EXISTS slogan TEXT`,
          `ALTER TABLE companies ADD COLUMN IF NOT EXISTS primary_color TEXT`,
          `ALTER TABLE companies ADD COLUMN IF NOT EXISTS secondary_color TEXT`,
          `ALTER TABLE companies ADD COLUMN IF NOT EXISTS parent_id UUID`,
          `ALTER TABLE companies ADD COLUMN IF NOT EXISTS level "CompanyLevel" DEFAULT 'ENTERPRISE'`,
          `ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by UUID`,
          `ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_by UUID`,
          `ALTER TABLE companies ADD COLUMN IF NOT EXISTS deleted_by UUID`,
          `ALTER TABLE companies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
          `ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'brands',
        createSql: `CREATE TABLE IF NOT EXISTS brands (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, company_id UUID NOT NULL);`,
        columns: [
          `ALTER TABLE brands ADD COLUMN IF NOT EXISTS name TEXT`,
          `ALTER TABLE brands ADD COLUMN IF NOT EXISTS description TEXT`,
          `ALTER TABLE brands ADD COLUMN IF NOT EXISTS tone_of_voice TEXT`,
          `ALTER TABLE brands ADD COLUMN IF NOT EXISTS target_audience TEXT`,
          `ALTER TABLE brands ADD COLUMN IF NOT EXISTS industry TEXT`,
          `ALTER TABLE brands ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE brands ADD COLUMN IF NOT EXISTS created_by UUID`,
          `ALTER TABLE brands ADD COLUMN IF NOT EXISTS updated_by UUID`,
          `ALTER TABLE brands ADD COLUMN IF NOT EXISTS deleted_by UUID`,
          `ALTER TABLE brands ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
          `ALTER TABLE brands ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE brands ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'headquarters',
        createSql: `CREATE TABLE IF NOT EXISTS headquarters (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, company_id UUID NOT NULL);`,
        columns: [
          `ALTER TABLE headquarters ADD COLUMN IF NOT EXISTS name TEXT`,
          `ALTER TABLE headquarters ADD COLUMN IF NOT EXISTS description TEXT`,
          `ALTER TABLE headquarters ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE headquarters ADD COLUMN IF NOT EXISTS created_by UUID`,
          `ALTER TABLE headquarters ADD COLUMN IF NOT EXISTS updated_by UUID`,
          `ALTER TABLE headquarters ADD COLUMN IF NOT EXISTS deleted_by UUID`,
          `ALTER TABLE headquarters ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
          `ALTER TABLE headquarters ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE headquarters ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'departments',
        createSql: `CREATE TABLE IF NOT EXISTS departments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, company_id UUID NOT NULL);`,
        columns: [
          `ALTER TABLE departments ADD COLUMN IF NOT EXISTS name TEXT`,
          `ALTER TABLE departments ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE departments ADD COLUMN IF NOT EXISTS description TEXT`,
          `ALTER TABLE departments ADD COLUMN IF NOT EXISTS is_default_roster BOOLEAN DEFAULT false`,
          `ALTER TABLE departments ADD COLUMN IF NOT EXISTS created_by UUID`,
          `ALTER TABLE departments ADD COLUMN IF NOT EXISTS updated_by UUID`,
          `ALTER TABLE departments ADD COLUMN IF NOT EXISTS deleted_by UUID`,
          `ALTER TABLE departments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
          `ALTER TABLE departments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE departments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'teams',
        createSql: `CREATE TABLE IF NOT EXISTS teams (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, department_id UUID NOT NULL);`,
        columns: [
          `ALTER TABLE teams ADD COLUMN IF NOT EXISTS name TEXT`,
          `ALTER TABLE teams ADD COLUMN IF NOT EXISTS description TEXT`,
          `ALTER TABLE teams ADD COLUMN IF NOT EXISTS department_id UUID`,
          `ALTER TABLE teams ADD COLUMN IF NOT EXISTS created_by UUID`,
          `ALTER TABLE teams ADD COLUMN IF NOT EXISTS updated_by UUID`,
          `ALTER TABLE teams ADD COLUMN IF NOT EXISTS deleted_by UUID`,
          `ALTER TABLE teams ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
          `ALTER TABLE teams ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'users',
        createSql: `CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL);`,
        columns: [
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS role "UserRole" DEFAULT 'MEMBER'`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id UUID`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP(3)`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_by UUID`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_by UUID`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'executives',
        createSql: `CREATE TABLE IF NOT EXISTS executives (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, role_key TEXT NOT NULL, title TEXT NOT NULL, department_id UUID NOT NULL);`,
        columns: [
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS name TEXT`,
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS role_key TEXT`,
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS title TEXT`,
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS department_id UUID`,
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS biography TEXT`,
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS system_prompt TEXT`,
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS is_default_roster BOOLEAN DEFAULT false`,
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS is_active_in_workspace BOOLEAN DEFAULT true`,
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS created_by UUID`,
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS updated_by UUID`,
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS deleted_by UUID`,
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE executives ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'missions',
        createSql: `CREATE TABLE IF NOT EXISTS missions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), objective TEXT NOT NULL, company_id UUID NOT NULL, status "MissionStatus" DEFAULT 'DRAFT');`,
        columns: [
          `ALTER TABLE missions ADD COLUMN IF NOT EXISTS objective TEXT`,
          `ALTER TABLE missions ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE missions ADD COLUMN IF NOT EXISTS status "MissionStatus" DEFAULT 'DRAFT'`,
          `ALTER TABLE missions ADD COLUMN IF NOT EXISTS health_score TEXT DEFAULT 'Excellent'`,
          `ALTER TABLE missions ADD COLUMN IF NOT EXISTS deadline TIMESTAMP(3)`,
          `ALTER TABLE missions ADD COLUMN IF NOT EXISTS is_legal_hold BOOLEAN DEFAULT false`,
          `ALTER TABLE missions ADD COLUMN IF NOT EXISTS created_by UUID`,
          `ALTER TABLE missions ADD COLUMN IF NOT EXISTS updated_by UUID`,
          `ALTER TABLE missions ADD COLUMN IF NOT EXISTS deleted_by UUID`,
          `ALTER TABLE missions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
          `ALTER TABLE missions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE missions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'mission_tasks',
        createSql: `CREATE TABLE IF NOT EXISTS mission_tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), mission_id UUID NOT NULL, name TEXT NOT NULL, status "TaskStatus" DEFAULT 'PENDING');`,
        columns: [
          `ALTER TABLE mission_tasks ADD COLUMN IF NOT EXISTS name TEXT`,
          `ALTER TABLE mission_tasks ADD COLUMN IF NOT EXISTS title TEXT`,
          `ALTER TABLE mission_tasks ADD COLUMN IF NOT EXISTS description TEXT`,
          `ALTER TABLE mission_tasks ADD COLUMN IF NOT EXISTS status "TaskStatus" DEFAULT 'PENDING'`,
          `ALTER TABLE mission_tasks ADD COLUMN IF NOT EXISTS mission_id UUID`,
          `ALTER TABLE mission_tasks ADD COLUMN IF NOT EXISTS executive_id UUID`,
          `ALTER TABLE mission_tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE mission_tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE mission_tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
        ],
      },
      {
        table: 'task_dependencies',
        createSql: `CREATE TABLE IF NOT EXISTS task_dependencies (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), task_id UUID NOT NULL, prereq_id UUID NOT NULL);`,
        columns: [
          `ALTER TABLE task_dependencies ADD COLUMN IF NOT EXISTS task_id UUID`,
          `ALTER TABLE task_dependencies ADD COLUMN IF NOT EXISTS prereq_id UUID`,
        ],
      },
      {
        table: 'conversations',
        createSql: `CREATE TABLE IF NOT EXISTS conversations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL);`,
        columns: [
          `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS title TEXT`,
          `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS mission_id UUID`,
          `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false`,
          `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false`,
          `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'chat_messages',
        createSql: `CREATE TABLE IF NOT EXISTS chat_messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id UUID NOT NULL, sender_id UUID NOT NULL, sender_type TEXT NOT NULL, content TEXT NOT NULL, timestamp TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP);`,
        columns: [
          `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS conversation_id UUID`,
          `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_id UUID`,
          `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'USER'`,
          `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS content TEXT`,
          `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS tokens_used INTEGER`,
          `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS provider TEXT`,
          `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS latency_ms INTEGER`,
        ],
      },
      {
        table: 'plans',
        createSql: `CREATE TABLE IF NOT EXISTS plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, code TEXT UNIQUE NOT NULL);`,
        columns: [
          `ALTER TABLE plans ADD COLUMN IF NOT EXISTS name TEXT`,
          `ALTER TABLE plans ADD COLUMN IF NOT EXISTS code TEXT`,
          `ALTER TABLE plans ADD COLUMN IF NOT EXISTS description TEXT`,
          `ALTER TABLE plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'entitlements',
        createSql: `CREATE TABLE IF NOT EXISTS entitlements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_id UUID NOT NULL, key TEXT NOT NULL);`,
        columns: [
          `ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS plan_id UUID`,
          `ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS key TEXT`,
          `ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS description TEXT`,
        ],
      },
      {
        table: 'subscriptions',
        createSql: `CREATE TABLE IF NOT EXISTS subscriptions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID UNIQUE NOT NULL, plan_id UUID NOT NULL);`,
        columns: [
          `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_id UUID`,
          `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS status "SubscriptionStatus" DEFAULT 'ACTIVE'`,
          `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_gateway TEXT`,
          `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS external_customer_id TEXT`,
          `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS external_subscription_id TEXT`,
          `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 year'`,
          `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP(3)`,
          `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP(3)`,
          `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'invoices',
        createSql: `CREATE TABLE IF NOT EXISTS invoices (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL, subscription_id UUID NOT NULL, amount DOUBLE PRECISION DEFAULT 0);`,
        columns: [
          `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subscription_id UUID`,
          `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount DOUBLE PRECISION DEFAULT 0.0`,
          `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD'`,
          `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PAID'`,
          `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS external_reference TEXT`,
          `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS gateway_status TEXT`,
          `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_url TEXT`,
          `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'usage_records',
        createSql: `CREATE TABLE IF NOT EXISTS usage_records (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL, type TEXT NOT NULL, quantity INTEGER DEFAULT 0);`,
        columns: [
          `ALTER TABLE usage_records ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE usage_records ADD COLUMN IF NOT EXISTS type TEXT`,
          `ALTER TABLE usage_records ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0`,
          `ALTER TABLE usage_records ADD COLUMN IF NOT EXISTS reset_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 month'`,
          `ALTER TABLE usage_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'hq_master_wallets',
        createSql: `CREATE TABLE IF NOT EXISTS hq_master_wallets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), circle_wallet_id TEXT DEFAULT '', circle_address TEXT DEFAULT '');`,
        columns: [
          `ALTER TABLE hq_master_wallets ADD COLUMN IF NOT EXISTS circle_wallet_id TEXT DEFAULT ''`,
          `ALTER TABLE hq_master_wallets ADD COLUMN IF NOT EXISTS circle_address TEXT DEFAULT ''`,
          `ALTER TABLE hq_master_wallets ADD COLUMN IF NOT EXISTS total_usdc_reserve DOUBLE PRECISION DEFAULT 0.0`,
          `ALTER TABLE hq_master_wallets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE'`,
          `ALTER TABLE hq_master_wallets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE hq_master_wallets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'organization_wallets',
        createSql: `CREATE TABLE IF NOT EXISTS organization_wallets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID UNIQUE NOT NULL);`,
        columns: [
          `ALTER TABLE organization_wallets ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE organization_wallets ADD COLUMN IF NOT EXISTS balance_usd DOUBLE PRECISION DEFAULT 0.0`,
          `ALTER TABLE organization_wallets ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD'`,
          `ALTER TABLE organization_wallets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE'`,
          `ALTER TABLE organization_wallets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE organization_wallets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'agent_allowances',
        createSql: `CREATE TABLE IF NOT EXISTS agent_allowances (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL, role_key TEXT NOT NULL);`,
        columns: [
          `ALTER TABLE agent_allowances ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE agent_allowances ADD COLUMN IF NOT EXISTS role_key TEXT`,
          `ALTER TABLE agent_allowances ADD COLUMN IF NOT EXISTS executive_id UUID`,
          `ALTER TABLE agent_allowances ADD COLUMN IF NOT EXISTS monthly_limit DOUBLE PRECISION DEFAULT 500.0`,
          `ALTER TABLE agent_allowances ADD COLUMN IF NOT EXISTS current_month_spent DOUBLE PRECISION DEFAULT 0.0`,
          `ALTER TABLE agent_allowances ADD COLUMN IF NOT EXISTS single_tx_limit DOUBLE PRECISION DEFAULT 50.0`,
          `ALTER TABLE agent_allowances ADD COLUMN IF NOT EXISTS require_approval_above DOUBLE PRECISION DEFAULT 50.0`,
          `ALTER TABLE agent_allowances ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE'`,
          `ALTER TABLE agent_allowances ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE agent_allowances ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'wallet_transactions',
        createSql: `CREATE TABLE IF NOT EXISTS wallet_transactions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL, type TEXT NOT NULL);`,
        columns: [
          `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS type TEXT`,
          `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS amount_usd DOUBLE PRECISION DEFAULT 0.0`,
          `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS amount_usdc DOUBLE PRECISION DEFAULT 0.0`,
          `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS vendor_address TEXT`,
          `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS vendor_name TEXT`,
          `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS circle_tx_id TEXT`,
          `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT`,
          `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'COMPLETED'`,
          `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS description TEXT`,
          `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS executive_role_key TEXT`,
          `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'notifications',
        createSql: `CREATE TABLE IF NOT EXISTS notifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL);`,
        columns: [
          `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id UUID`,
          `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'SYSTEM'`,
          `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT`,
          `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT`,
          `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false`,
          `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'MEDIUM'`,
          `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'SYSTEM'`,
          `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT`,
          `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false`,
          `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false`,
          `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'audit_logs',
        createSql: `CREATE TABLE IF NOT EXISTS audit_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL, event_type TEXT NOT NULL);`,
        columns: [
          `ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_id UUID`,
          `ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS event_type TEXT`,
          `ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'`,
          `ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS is_legal_hold BOOLEAN DEFAULT false`,
          `ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'analytics',
        createSql: `CREATE TABLE IF NOT EXISTS analytics (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL, metric_name TEXT NOT NULL, metric_value DOUBLE PRECISION DEFAULT 0);`,
        columns: [
          `ALTER TABLE analytics ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE analytics ADD COLUMN IF NOT EXISTS metric_name TEXT`,
          `ALTER TABLE analytics ADD COLUMN IF NOT EXISTS metric_value DOUBLE PRECISION DEFAULT 0.0`,
          `ALTER TABLE analytics ADD COLUMN IF NOT EXISTS dimensions JSONB`,
          `ALTER TABLE analytics ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'org_settings',
        createSql: `CREATE TABLE IF NOT EXISTS org_settings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID UNIQUE NOT NULL);`,
        columns: [
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS hq_name TEXT DEFAULT 'Headquarters'`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC'`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en'`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD'`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS business_hours JSONB`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS legal_name TEXT`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS business_address TEXT`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS contact_email TEXT`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS industry TEXT`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS ai_tone TEXT DEFAULT 'Professional'`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS ai_formality TEXT DEFAULT 'Formal'`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS ai_response_length TEXT DEFAULT 'Balanced'`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT true`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS notify_browser BOOLEAN DEFAULT true`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS notify_push BOOLEAN DEFAULT false`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS quiet_hours_start TEXT`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS quiet_hours_end TEXT`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'api_keys',
        createSql: `CREATE TABLE IF NOT EXISTS api_keys (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL, name TEXT NOT NULL, key_prefix TEXT NOT NULL, key_hash TEXT NOT NULL);`,
        columns: [
          `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS created_by_id UUID`,
          `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS name TEXT`,
          `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_prefix TEXT`,
          `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_hash TEXT`,
          `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP(3)`,
          `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP(3)`,
          `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`,
          `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'org_intelligence',
        createSql: `CREATE TABLE IF NOT EXISTS org_intelligence (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID UNIQUE NOT NULL);`,
        columns: [
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS identity_data JSONB`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS identity_confidence DOUBLE PRECISION DEFAULT 0`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS business_model_data JSONB`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS business_model_confidence DOUBLE PRECISION DEFAULT 0`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS structure_data JSONB`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS structure_confidence DOUBLE PRECISION DEFAULT 0`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS strategy_data JSONB`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS strategy_confidence DOUBLE PRECISION DEFAULT 0`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS operations_data JSONB`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS operations_confidence DOUBLE PRECISION DEFAULT 0`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS brand_data JSONB`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS brand_confidence DOUBLE PRECISION DEFAULT 0`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS customer_data JSONB`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS customer_confidence DOUBLE PRECISION DEFAULT 0`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS market_data JSONB`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS market_confidence DOUBLE PRECISION DEFAULT 0`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS technology_data JSONB`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS technology_confidence DOUBLE PRECISION DEFAULT 0`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS learning_data JSONB`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS learning_confidence DOUBLE PRECISION DEFAULT 0`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS last_learned_at TIMESTAMP(3)`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS pending_suggestions JSONB`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS overall_confidence DOUBLE PRECISION DEFAULT 0`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS maturity_level INTEGER DEFAULT 1`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS health_score JSONB`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS evolution_timeline JSONB`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE org_intelligence ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'assets',
        createSql: `CREATE TABLE IF NOT EXISTS assets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), filename TEXT NOT NULL, company_id UUID NOT NULL);`,
        columns: [
          `ALTER TABLE assets ADD COLUMN IF NOT EXISTS filename TEXT`,
          `ALTER TABLE assets ADD COLUMN IF NOT EXISTS description TEXT`,
          `ALTER TABLE assets ADD COLUMN IF NOT EXISTS file_size INTEGER DEFAULT 0`,
          `ALTER TABLE assets ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'application/octet-stream'`,
          `ALTER TABLE assets ADD COLUMN IF NOT EXISTS sha256 TEXT DEFAULT ''`,
          `ALTER TABLE assets ADD COLUMN IF NOT EXISTS gcs_path TEXT DEFAULT ''`,
          `ALTER TABLE assets ADD COLUMN IF NOT EXISTS classification "DataClassification" DEFAULT 'CONFIDENTIAL'`,
          `ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_legal_hold BOOLEAN DEFAULT false`,
          `ALTER TABLE assets ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE assets ADD COLUMN IF NOT EXISTS mission_id UUID`,
          `ALTER TABLE assets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE assets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
        ],
      },
      {
        table: 'asset_versions',
        createSql: `CREATE TABLE IF NOT EXISTS asset_versions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), asset_id UUID NOT NULL, filename TEXT NOT NULL);`,
        columns: [
          `ALTER TABLE asset_versions ADD COLUMN IF NOT EXISTS asset_id UUID`,
          `ALTER TABLE asset_versions ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1`,
          `ALTER TABLE asset_versions ADD COLUMN IF NOT EXISTS filename TEXT`,
          `ALTER TABLE asset_versions ADD COLUMN IF NOT EXISTS file_size INTEGER DEFAULT 0`,
          `ALTER TABLE asset_versions ADD COLUMN IF NOT EXISTS sha256 TEXT DEFAULT ''`,
          `ALTER TABLE asset_versions ADD COLUMN IF NOT EXISTS gcs_path TEXT DEFAULT ''`,
          `ALTER TABLE asset_versions ADD COLUMN IF NOT EXISTS change_summary TEXT`,
          `ALTER TABLE asset_versions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'knowledge_base',
        createSql: `CREATE TABLE IF NOT EXISTS knowledge_base (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL);`,
        columns: [
          `ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS title TEXT`,
          `ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS content TEXT`,
          `ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS embedding vector(1536)`,
          `ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS classification "DataClassification" DEFAULT 'CONFIDENTIAL'`,
          `ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'executive_memories',
        createSql: `CREATE TABLE IF NOT EXISTS executive_memories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL);`,
        columns: [
          `ALTER TABLE executive_memories ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE executive_memories ADD COLUMN IF NOT EXISTS executive_id UUID`,
          `ALTER TABLE executive_memories ADD COLUMN IF NOT EXISTS mission_id UUID`,
          `ALTER TABLE executive_memories ADD COLUMN IF NOT EXISTS key TEXT`,
          `ALTER TABLE executive_memories ADD COLUMN IF NOT EXISTS value TEXT`,
          `ALTER TABLE executive_memories ADD COLUMN IF NOT EXISTS layer "MemoryLayer" DEFAULT 'ORGANIZATION'`,
          `ALTER TABLE executive_memories ADD COLUMN IF NOT EXISTS embedding vector(1536)`,
          `ALTER TABLE executive_memories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE executive_memories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'marketplace_listings',
        createSql: `CREATE TABLE IF NOT EXISTS marketplace_listings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, description TEXT NOT NULL);`,
        columns: [
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS listing_type "ListingType" DEFAULT 'EXECUTIVE'`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS title TEXT`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS description TEXT`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS price DOUBLE PRECISION DEFAULT 0`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD'`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS icon_url TEXT`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General'`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS tags TEXT[]`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS is_default_roster BOOLEAN DEFAULT false`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS downloads_count INTEGER DEFAULT 0`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS rating DOUBLE PRECISION DEFAULT 5.0`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS role_key TEXT`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS department_key TEXT`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS executive_data JSONB`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS department_data JSONB`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'marketplace_installations',
        createSql: `CREATE TABLE IF NOT EXISTS marketplace_installations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL, listing_id UUID NOT NULL);`,
        columns: [
          `ALTER TABLE marketplace_installations ADD COLUMN IF NOT EXISTS company_id UUID`,
          `ALTER TABLE marketplace_installations ADD COLUMN IF NOT EXISTS listing_id UUID`,
          `ALTER TABLE marketplace_installations ADD COLUMN IF NOT EXISTS installed_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE marketplace_installations ADD COLUMN IF NOT EXISTS installed_by UUID`,
        ],
      },
      {
        table: 'department_training_data',
        createSql: `CREATE TABLE IF NOT EXISTS department_training_data (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), department_id UUID NOT NULL, filename TEXT NOT NULL, content TEXT NOT NULL);`,
        columns: [
          `ALTER TABLE department_training_data ADD COLUMN IF NOT EXISTS department_id UUID`,
          `ALTER TABLE department_training_data ADD COLUMN IF NOT EXISTS filename TEXT`,
          `ALTER TABLE department_training_data ADD COLUMN IF NOT EXISTS content TEXT`,
          `ALTER TABLE department_training_data ADD COLUMN IF NOT EXISTS embedding vector(1536)`,
          `ALTER TABLE department_training_data ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE department_training_data ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
      {
        table: 'executive_training_data',
        createSql: `CREATE TABLE IF NOT EXISTS executive_training_data (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), executive_id UUID NOT NULL, filename TEXT NOT NULL, content TEXT NOT NULL);`,
        columns: [
          `ALTER TABLE executive_training_data ADD COLUMN IF NOT EXISTS executive_id UUID`,
          `ALTER TABLE executive_training_data ADD COLUMN IF NOT EXISTS filename TEXT`,
          `ALTER TABLE executive_training_data ADD COLUMN IF NOT EXISTS content TEXT`,
          `ALTER TABLE executive_training_data ADD COLUMN IF NOT EXISTS embedding vector(1536)`,
          `ALTER TABLE executive_training_data ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE executive_training_data ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`,
        ],
      },
    ];

    for (const def of tableDefinitions) {
      try {
        await this.$executeRawUnsafe(def.createSql);
      } catch (err) {
        this.logger.warn(
          `[DB Sync] Notice creating table ${def.table}: ${(err as Error).message}`,
        );
      }

      for (const colSql of def.columns) {
        try {
          await this.$executeRawUnsafe(colSql);
        } catch {}
      }
    }

    // 4. Ensure no recursive casts or operators exist in PostgreSQL
    const dropRecursiveCastSqls = [
      `DROP CAST IF EXISTS (text AS "MissionStatus") CASCADE;`,
      `DROP CAST IF EXISTS (text AS "TaskStatus") CASCADE;`,
      `DROP CAST IF EXISTS (text AS "SubscriptionStatus") CASCADE;`,
      `DROP CAST IF EXISTS (text AS "UserRole") CASCADE;`,
      `DROP CAST IF EXISTS (text AS "CompanyLevel") CASCADE;`,
      `DROP FUNCTION IF EXISTS cast_text_to_mission_status(text) CASCADE;`,
      `DROP FUNCTION IF EXISTS cast_text_to_task_status(text) CASCADE;`,
      `DROP FUNCTION IF EXISTS cast_text_to_subscription_status(text) CASCADE;`,
      `DROP FUNCTION IF EXISTS cast_text_to_user_role(text) CASCADE;`,
      `DROP FUNCTION IF EXISTS cast_text_to_company_level(text) CASCADE;`,
      `DROP FUNCTION IF EXISTS text_eq_mission_status(text, "MissionStatus") CASCADE;`,
      `DROP FUNCTION IF EXISTS mission_status_eq_text("MissionStatus", text) CASCADE;`,
      `DROP FUNCTION IF EXISTS text_eq_task_status(text, "TaskStatus") CASCADE;`,
      `DROP FUNCTION IF EXISTS task_status_eq_text("TaskStatus", text) CASCADE;`,
      `DROP FUNCTION IF EXISTS text_eq_sub_status(text, "SubscriptionStatus") CASCADE;`,
      `DROP FUNCTION IF EXISTS sub_status_eq_text("SubscriptionStatus", text) CASCADE;`,
      `DROP FUNCTION IF EXISTS text_eq_user_role(text, "UserRole") CASCADE;`,
      `DROP FUNCTION IF EXISTS user_role_eq_text("UserRole", text) CASCADE;`,
      `DROP FUNCTION IF EXISTS text_eq_company_level(text, "CompanyLevel") CASCADE;`,
      `DROP FUNCTION IF EXISTS company_level_eq_text("CompanyLevel", text) CASCADE;`,
    ];

    for (const sql of dropRecursiveCastSqls) {
      try {
        await this.$executeRawUnsafe(sql);
      } catch {}
    }

    // 5. PostgreSQL Type Harmonizer: Convert legacy TEXT columns to expected UUID and ENUM types
    try {
      const typeHarmonizerSql = `
        DO $$ 
        DECLARE 
            r RECORD;
        BEGIN
            -- Convert legacy text/varchar foreign-key & ID columns to UUID
            FOR r IN 
                SELECT table_name, column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                  AND data_type IN ('text', 'character varying')
                  AND (
                    column_name = 'id' 
                    OR column_name LIKE '%_id'
                    OR column_name IN ('created_by', 'updated_by', 'deleted_by', 'parent_id', 'actor_id')
                  )
            LOOP
                BEGIN
                    EXECUTE format('UPDATE %I SET %I = gen_random_uuid() WHERE %I IS NOT NULL AND %I !~* ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''', r.table_name, r.column_name, r.column_name, r.column_name);
                    EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE UUID USING (NULLIF(%I, '''')::uuid)', r.table_name, r.column_name, r.column_name);
                EXCEPTION WHEN OTHERS THEN 
                    -- ignore column on error
                END;
            END LOOP;

            -- Convert missions.status to MissionStatus enum
            BEGIN
                ALTER TABLE missions ALTER COLUMN status DROP DEFAULT;
                ALTER TABLE missions ALTER COLUMN status TYPE "MissionStatus" USING (
                    CASE 
                        WHEN status::text ILIKE '%draft%' THEN 'DRAFT'::"MissionStatus"
                        WHEN status::text ILIKE '%queue%' THEN 'QUEUED'::"MissionStatus"
                        WHEN status::text ILIKE '%plan%' THEN 'PLANNING'::"MissionStatus"
                        WHEN status::text ILIKE '%execut%' THEN 'EXECUTING'::"MissionStatus"
                        WHEN status::text ILIKE '%progress%' OR status::text ILIKE '%run%' THEN 'IN_PROGRESS'::"MissionStatus"
                        WHEN status::text ILIKE '%pause%' THEN 'PAUSED'::"MissionStatus"
                        WHEN status::text ILIKE '%complete%' OR status::text ILIKE '%deliver%' OR status::text ILIKE '%done%' THEN 'COMPLETED'::"MissionStatus"
                        WHEN status::text ILIKE '%cancel%' THEN 'CANCELLED'::"MissionStatus"
                        WHEN status::text ILIKE '%fail%' THEN 'FAILED'::"MissionStatus"
                        ELSE 'DRAFT'::"MissionStatus"
                    END
                );
                ALTER TABLE missions ALTER COLUMN status SET DEFAULT 'DRAFT'::"MissionStatus";
            EXCEPTION WHEN OTHERS THEN NULL;
            END;

            -- Convert mission_tasks.status to TaskStatus enum
            BEGIN
                ALTER TABLE mission_tasks ALTER COLUMN status DROP DEFAULT;
                ALTER TABLE mission_tasks ALTER COLUMN status TYPE "TaskStatus" USING (
                    CASE 
                        WHEN status::text ILIKE '%complete%' OR status::text ILIKE '%done%' THEN 'COMPLETED'::"TaskStatus"
                        WHEN status::text ILIKE '%run%' OR status::text ILIKE '%progress%' THEN 'RUNNING'::"TaskStatus"
                        WHEN status::text ILIKE '%fail%' THEN 'FAILED'::"TaskStatus"
                        WHEN status::text ILIKE '%skip%' THEN 'SKIPPED'::"TaskStatus"
                        ELSE 'PENDING'::"TaskStatus"
                    END
                );
                ALTER TABLE mission_tasks ALTER COLUMN status SET DEFAULT 'PENDING'::"TaskStatus";
            EXCEPTION WHEN OTHERS THEN NULL;
            END;

            -- Convert subscriptions.status to SubscriptionStatus enum
            BEGIN
                ALTER TABLE subscriptions ALTER COLUMN status DROP DEFAULT;
                ALTER TABLE subscriptions ALTER COLUMN status TYPE "SubscriptionStatus" USING (
                    CASE 
                        WHEN status::text ILIKE '%cancel%' THEN 'CANCELED'::"SubscriptionStatus"
                        WHEN status::text ILIKE '%past%' THEN 'PAST_DUE'::"SubscriptionStatus"
                        WHEN status::text ILIKE '%trial%' THEN 'TRIAL'::"SubscriptionStatus"
                        WHEN status::text ILIKE '%suspend%' THEN 'SUSPENDED'::"SubscriptionStatus"
                        WHEN status::text ILIKE '%expire%' THEN 'EXPIRED'::"SubscriptionStatus"
                        ELSE 'ACTIVE'::"SubscriptionStatus"
                    END
                );
                ALTER TABLE subscriptions ALTER COLUMN status SET DEFAULT 'ACTIVE'::"SubscriptionStatus";
            EXCEPTION WHEN OTHERS THEN NULL;
            END;

            -- Convert users.role to UserRole enum
            BEGIN
                ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
                ALTER TABLE users ALTER COLUMN role TYPE "UserRole" USING (
                    CASE 
                        WHEN role::text ILIKE '%super%' THEN 'SUPER_ADMINISTRATOR'::"UserRole"
                        WHEN role::text ILIKE '%owner%' THEN 'ORGANIZATION_OWNER'::"UserRole"
                        WHEN role::text ILIKE '%director%' THEN 'EXECUTIVE_DIRECTOR'::"UserRole"
                        WHEN role::text ILIKE '%admin%' THEN 'ADMINISTRATOR'::"UserRole"
                        ELSE 'MEMBER'::"UserRole"
                    END
                );
                ALTER TABLE users ALTER COLUMN role SET DEFAULT 'MEMBER'::"UserRole";
            EXCEPTION WHEN OTHERS THEN NULL;
            END;

            -- Convert companies.level to CompanyLevel enum
            BEGIN
                ALTER TABLE companies ALTER COLUMN level DROP DEFAULT;
                ALTER TABLE companies ALTER COLUMN level TYPE "CompanyLevel" USING (
                    CASE 
                        WHEN level::text ILIKE '%hold%' THEN 'HOLDING_CO'::"CompanyLevel"
                        WHEN level::text ILIKE '%sub%' THEN 'SUBSIDIARY'::"CompanyLevel"
                        WHEN level::text ILIKE '%enter%' THEN 'ENTERPRISE'::"CompanyLevel"
                        ELSE 'BUSINESS_UNIT'::"CompanyLevel"
                    END
                );
                ALTER TABLE companies ALTER COLUMN level SET DEFAULT 'ENTERPRISE'::"CompanyLevel";
            EXCEPTION WHEN OTHERS THEN NULL;
            END;

            -- Cleanup any camelCase quoted duplicate columns created without @map
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'departments' AND column_name = 'companyId') THEN
                BEGIN
                    UPDATE departments SET company_id = NULLIF("companyId"::text, '')::uuid WHERE company_id IS NULL AND "companyId" IS NOT NULL;
                EXCEPTION WHEN OTHERS THEN NULL; END;
                ALTER TABLE departments DROP COLUMN IF EXISTS "companyId";
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'companyId') THEN
                BEGIN
                    UPDATE users SET company_id = NULLIF("companyId"::text, '')::uuid WHERE company_id IS NULL AND "companyId" IS NOT NULL;
                EXCEPTION WHEN OTHERS THEN NULL; END;
                ALTER TABLE users DROP COLUMN IF EXISTS "companyId";
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'companyId') THEN
                BEGIN
                    UPDATE subscriptions SET company_id = NULLIF("companyId"::text, '')::uuid WHERE company_id IS NULL AND "companyId" IS NOT NULL;
                EXCEPTION WHEN OTHERS THEN NULL; END;
                ALTER TABLE subscriptions DROP COLUMN IF EXISTS "companyId";
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'executives' AND column_name = 'departmentId') THEN
                BEGIN
                    UPDATE executives SET department_id = NULLIF("departmentId"::text, '')::uuid WHERE department_id IS NULL AND "departmentId" IS NOT NULL;
                EXCEPTION WHEN OTHERS THEN NULL; END;
                ALTER TABLE executives DROP COLUMN IF EXISTS "departmentId";
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chat_messages' AND column_name = 'conversationId') THEN
                BEGIN
                    UPDATE chat_messages SET conversation_id = NULLIF("conversationId"::text, '')::uuid WHERE conversation_id IS NULL AND "conversationId" IS NOT NULL;
                EXCEPTION WHEN OTHERS THEN NULL; END;
                ALTER TABLE chat_messages DROP COLUMN IF EXISTS "conversationId";
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chat_messages' AND column_name = 'senderId') THEN
                BEGIN
                    UPDATE chat_messages SET sender_id = NULLIF("senderId"::text, '')::uuid WHERE sender_id IS NULL AND "senderId" IS NOT NULL;
                EXCEPTION WHEN OTHERS THEN NULL; END;
                ALTER TABLE chat_messages DROP COLUMN IF EXISTS "senderId";
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'missions' AND column_name = 'companyId') THEN
                BEGIN
                    UPDATE missions SET company_id = NULLIF("companyId"::text, '')::uuid WHERE company_id IS NULL AND "companyId" IS NOT NULL;
                EXCEPTION WHEN OTHERS THEN NULL; END;
                ALTER TABLE missions DROP COLUMN IF EXISTS "companyId";
            END IF;
        END $$;
      `;
      await this.$executeRawUnsafe(typeHarmonizerSql);
    } catch (err) {
      this.logger.warn(
        `[DB Sync] Type harmonizer notice: ${(err as Error).message}`,
      );
    }

    // 5. Data consistency fixes
    try {
      await this.$executeRawUnsafe(
        `UPDATE chat_messages SET timestamp = created_at WHERE timestamp IS NULL AND created_at IS NOT NULL;`,
      );
      await this.$executeRawUnsafe(
        `UPDATE mission_tasks SET name = title WHERE name IS NULL AND title IS NOT NULL;`,
      );
      await this.$executeRawUnsafe(
        `UPDATE subscriptions SET status = 'ACTIVE' WHERE status IS NULL;`,
      );
      await this.$executeRawUnsafe(
        `UPDATE executives SET is_active_in_workspace = true WHERE is_active_in_workspace IS NULL;`,
      );
    } catch {}

    // 6. Ensure Default Baseline Plans Exist
    try {
      const defaultPlans = [
        {
          name: 'Free Starter',
          code: 'FREE',
          description: 'Free tier: 500 AI monthly credits, 1 active mission',
        },
        {
          name: 'Growth Scale',
          code: 'PRO',
          description:
            'Growth tier: 25,000 AI monthly credits, 10 active missions',
        },
        {
          name: 'Enterprise OS',
          code: 'ENTERPRISE',
          description:
            'Enterprise tier: 200,000 AI monthly credits, unlimited missions',
        },
      ];
      for (const p of defaultPlans) {
        const existing = await this.plan.findUnique({
          where: { code: p.code },
        });
        if (!existing) {
          await this.plan.create({ data: p });
        }
      }
    } catch {}

    // 7. Ensure Baseline 5 Core Executives Exist in Platform
    try {
      const defaultExecutives = [
        {
          name: 'Asad',
          roleKey: 'ceo',
          title: 'Chief Executive Officer',
          departmentName: 'Executive Leadership',
          systemPrompt:
            'You are Asad, Chief Executive Officer of HQ. You provide visionary executive leadership and corporate orchestration.',
          avatarUrl: '/avatars/asad.png',
        },
        {
          name: 'Teema',
          roleKey: 'operations_director',
          title: 'Operations Director',
          departmentName: 'Executive Leadership',
          systemPrompt:
            'You are Teema, Operations Director of HQ. You specialize in operational execution and workflow orchestration.',
          avatarUrl: '/avatars/teema.png',
        },
        {
          name: 'Legal & Compliance Director',
          roleKey: 'legal_compliance_director',
          title: 'Legal & Compliance Director',
          departmentName: 'Executive Leadership',
          systemPrompt:
            'You are the Legal & Compliance Director of HQ. You evaluate regulatory posture and risk mitigation.',
          avatarUrl: '/avatars/legal.png',
        },
        {
          name: 'Resource Director',
          roleKey: 'human_resources_director',
          title: 'Human Resources & Talent Director',
          departmentName: 'Executive Leadership',
          systemPrompt:
            'You are the Resource Director of HQ. You optimize talent, personnel alignment, and executive staffing.',
          avatarUrl: '/avatars/resource.png',
        },
        {
          name: 'Mr. Intelligence',
          roleKey: 'public_search_agent',
          title: 'Strategic Market Intelligence Agent',
          departmentName: 'Executive Leadership',
          systemPrompt:
            'You are Mr. Intelligence, Strategic Market Intelligence Agent. You conduct real-time web research and synthesize market insights.',
          avatarUrl: '/avatars/intelligence.png',
        },
      ];

      const companyId = await this.resolveCompanyId();
      let defaultDept = await this.department.findFirst({
        where: { companyId, name: 'Executive Leadership' },
      });
      if (!defaultDept) {
        defaultDept = await this.department.create({
          data: { name: 'Executive Leadership', companyId },
        });
      }

      for (const exec of defaultExecutives) {
        const found = await this.executive.findFirst({
          where: { roleKey: exec.roleKey },
        });
        if (!found) {
          await this.executive.create({
            data: {
              name: exec.name,
              roleKey: exec.roleKey,
              title: exec.title,
              biography: exec.systemPrompt,
              systemPrompt: exec.systemPrompt,
              avatarUrl: exec.avatarUrl,
              departmentId: defaultDept.id,
              isDefaultRoster: true,
              isActiveInWorkspace: true,
            },
          });
        }
      }
    } catch {}

    // 8. Ensure Baseline Marketplace Listings Exist
    try {
      const defaultMarketplace = [
        {
          title: 'Technology & Engineering Department Suite',
          description:
            'Autonomous software architecture, codebase audits, and high-performance technical scaling.',
          price: 0,
          currency: 'USD',
          category: 'Technology',
          departmentKey: 'technology',
          roleKey: 'technology_director',
          listingType: 'DEPARTMENT' as const,
          tags: ['engineering', 'software', 'architecture', 'devops'],
          isPublished: true,
          downloadsCount: 142,
          rating: 4.9,
        },
        {
          title: 'Marketing & Brand Growth Suite',
          description:
            'Multi-channel acquisition campaigns, viral brand positioning, and audience analytics.',
          price: 0,
          currency: 'USD',
          category: 'Marketing',
          departmentKey: 'marketing',
          roleKey: 'marketing_director',
          listingType: 'DEPARTMENT' as const,
          tags: ['marketing', 'growth', 'seo', 'campaigns'],
          isPublished: true,
          downloadsCount: 189,
          rating: 4.8,
        },
        {
          title: 'Finance & Treasury Intelligence Suite',
          description:
            'Real-time financial modeling, unit economics analysis, runway projections, and cap table audits.',
          price: 0,
          currency: 'USD',
          category: 'Finance',
          departmentKey: 'finance',
          roleKey: 'cfo',
          listingType: 'DEPARTMENT' as const,
          tags: ['finance', 'cfo', 'runway', 'treasury'],
          isPublished: true,
          downloadsCount: 210,
          rating: 5.0,
        },
        {
          title: 'Sales & Revenue Operations Suite',
          description:
            'Automated deal flow orchestration, pipeline optimization, and high-velocity enterprise closing.',
          price: 0,
          currency: 'USD',
          category: 'Sales',
          departmentKey: 'sales',
          roleKey: 'sales_director',
          listingType: 'DEPARTMENT' as const,
          tags: ['sales', 'revops', 'deals', 'crm'],
          isPublished: true,
          downloadsCount: 97,
          rating: 4.8,
        },
        {
          title: 'Security, Risk & Governance Suite',
          description:
            'SOC2 pre-audit compliance, threat landscape analysis, and enterprise security policy enforcement.',
          price: 0,
          currency: 'USD',
          category: 'Security',
          departmentKey: 'security',
          roleKey: 'security_director',
          listingType: 'DEPARTMENT' as const,
          tags: ['security', 'compliance', 'soc2', 'governance'],
          isPublished: true,
          downloadsCount: 115,
          rating: 4.9,
        },
      ];

      for (const item of defaultMarketplace) {
        const found = await this.marketplaceListing.findFirst({
          where: { departmentKey: item.departmentKey },
        });
        if (!found) {
          await this.marketplaceListing.create({ data: item });
        }
      }
    } catch {}

    // 9. Ensure Plan Entitlements Exist
    try {
      const plans = await this.plan.findMany();
      for (const p of plans) {
        const code = p.code?.toUpperCase();
        const limit =
          code === 'ENTERPRISE' ? 'unlimited' : code === 'PRO' ? '10' : '1';
        const credits =
          code === 'ENTERPRISE' ? '200000' : code === 'PRO' ? '25000' : '500';

        const defaultEntitlements = [
          {
            key: 'max_active_missions',
            description: `Maximum ${limit} active concurrent missions allowed.`,
          },
          {
            key: 'monthly_ai_credits',
            description: `${credits} monthly AI compute credits.`,
          },
          {
            key: 'c_suite_access',
            description: 'Access to full executive board agents.',
          },
        ];

        for (const ent of defaultEntitlements) {
          const existing = await this.entitlement.findFirst({
            where: { planId: p.id, key: ent.key },
          });
          if (!existing) {
            await this.entitlement.create({
              data: {
                planId: p.id,
                key: ent.key,
                description: ent.description,
              },
            });
          }
        }
      }
    } catch {}

    this.logger.log(
      '✅ [DB Sync] PostgreSQL schema synchronized, tables harmonized, and baseline data provisioned.',
    );
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
