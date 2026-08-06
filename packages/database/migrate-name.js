const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Running SQL Migration: Adding "name" column to "users" table...');
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;');
    console.log('✅ SQL Migration Executed Successfully! "name" column is now present.');
  } catch (err) {
    console.error('❌ Migration Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
