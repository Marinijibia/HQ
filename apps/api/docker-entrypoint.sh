#!/bin/sh
set -e

echo "=================================================="
echo "🚀 [HQ Container Entrypoint] Booting GCP API Container..."
echo "=================================================="

# Run Prisma schema push if DATABASE_URL is present
if [ -n "$DATABASE_URL" ]; then
  echo "📦 [Prisma Migration] Synchronizing database schema against PostgreSQL Cloud SQL..."
  npx prisma db push --schema=packages/database/prisma/schema.prisma --accept-data-loss || {
    echo "⚠️ [Prisma Migration] Notice during prisma db push. Fallback self-healing in PrismaService will execute on boot."
  }
else
  echo "ℹ️ [Prisma Migration] DATABASE_URL not set - skipping migration deploy."
fi

echo "⚡ [HQ Container Entrypoint] Launching NestJS API Monolith Engine..."
exec "$@"
