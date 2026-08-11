/*
  Warnings:

  - A unique constraint covering the columns `[firebase_uid]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('EXECUTIVE', 'DEPARTMENT');

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "slogan" TEXT;

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "is_default_roster" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "executives" ADD COLUMN     "is_active_in_workspace" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_default_roster" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "firebase_uid" TEXT,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "photo_url" TEXT;

-- CreateTable
CREATE TABLE "marketplace_listings" (
    "id" UUID NOT NULL,
    "listing_type" "ListingType" NOT NULL DEFAULT 'EXECUTIVE',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "icon_url" TEXT,
    "category" TEXT NOT NULL DEFAULT 'General',
    "tags" TEXT[],
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "is_default_roster" BOOLEAN NOT NULL DEFAULT false,
    "downloads_count" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "role_key" TEXT,
    "department_key" TEXT,
    "executive_data" JSONB,
    "department_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_installations" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "installed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "installed_by" UUID,

    CONSTRAINT "marketplace_installations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_training_data" (
    "id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_training_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_training_data" (
    "id" UUID NOT NULL,
    "executive_id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_training_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marketplace_installations_company_id_idx" ON "marketplace_installations"("company_id");

-- CreateIndex
CREATE INDEX "marketplace_installations_listing_id_idx" ON "marketplace_installations"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_installations_company_id_listing_id_key" ON "marketplace_installations"("company_id", "listing_id");

-- CreateIndex
CREATE INDEX "department_training_data_department_id_idx" ON "department_training_data"("department_id");

-- CreateIndex
CREATE INDEX "executive_training_data_executive_id_idx" ON "executive_training_data"("executive_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");

-- AddForeignKey
ALTER TABLE "marketplace_installations" ADD CONSTRAINT "marketplace_installations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_installations" ADD CONSTRAINT "marketplace_installations_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "marketplace_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_training_data" ADD CONSTRAINT "department_training_data_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_training_data" ADD CONSTRAINT "executive_training_data_executive_id_fkey" FOREIGN KEY ("executive_id") REFERENCES "executives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
