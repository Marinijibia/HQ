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
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          "displayName" TEXT,
          "photoUrl" TEXT,
          "firebaseUid" TEXT UNIQUE,
          role TEXT NOT NULL DEFAULT 'MEMBER',
          "companyId" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS companies (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          slogan TEXT,
          industry TEXT,
          "targetAudience" TEXT,
          goals TEXT[],
          "operatingStyle" TEXT,
          accent TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS departments (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          "companyId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS executives (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          "roleKey" TEXT NOT NULL,
          title TEXT NOT NULL,
          "departmentId" TEXT NOT NULL,
          "companyId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      this.logger.log('Core PostgreSQL database schema verified.');
    } catch (e) {
      // Ignore table creation if DB is offline
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
