-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "external_reference" TEXT,
ADD COLUMN     "gateway_status" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "external_customer_id" TEXT,
ADD COLUMN     "external_subscription_id" TEXT,
ADD COLUMN     "payment_gateway" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password_hash" TEXT;

-- CreateTable
CREATE TABLE "hq_master_wallets" (
    "id" UUID NOT NULL,
    "circle_wallet_id" TEXT NOT NULL,
    "circle_address" TEXT NOT NULL,
    "total_usdc_reserve" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hq_master_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_wallets" (
    "id" UUID NOT NULL,
    "balance_usd" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "organization_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_allowances" (
    "id" UUID NOT NULL,
    "executive_id" UUID,
    "role_key" TEXT NOT NULL,
    "monthly_limit" DOUBLE PRECISION NOT NULL DEFAULT 500.0,
    "current_month_spent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "single_tx_limit" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "require_approval_above" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "agent_allowances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "amount_usd" DOUBLE PRECISION NOT NULL,
    "amount_usdc" DOUBLE PRECISION NOT NULL,
    "vendor_address" TEXT,
    "vendor_name" TEXT,
    "circle_tx_id" TEXT,
    "blockchain_tx_hash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "description" TEXT,
    "executive_role_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_wallets_company_id_key" ON "organization_wallets"("company_id");

-- CreateIndex
CREATE INDEX "organization_wallets_company_id_idx" ON "organization_wallets"("company_id");

-- CreateIndex
CREATE INDEX "agent_allowances_company_id_idx" ON "agent_allowances"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_allowances_company_id_role_key_key" ON "agent_allowances"("company_id", "role_key");

-- CreateIndex
CREATE INDEX "wallet_transactions_company_id_idx" ON "wallet_transactions"("company_id");

-- AddForeignKey
ALTER TABLE "organization_wallets" ADD CONSTRAINT "organization_wallets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_allowances" ADD CONSTRAINT "agent_allowances_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
