#!/bin/sh
set -e

echo "=================================================="
echo "🚀 [HQ Container Entrypoint] Booting GCP API Container..."
echo "=================================================="

# Run Prisma Migration Deploy & DB Push fallback if DATABASE_URL is defined
if [ -n "$DATABASE_URL" ]; then
  echo "📦 [Prisma Migration] Running prisma migrate deploy against Cloud SQL..."
  npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma || {
    echo "⚠️ [Prisma Migration] Migrate deploy hit schema conflict - running db push fallback..."
    npx prisma db push --schema=packages/database/prisma/schema.prisma --accept-data-loss
  }
else
  echo "ℹ️ [Prisma Migration] DATABASE_URL not set - skipping migration deploy."
fi

echo "⚡ [HQ Container Entrypoint] Launching NestJS API Monolith Engine..."
exec "$@"
