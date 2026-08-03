############################################################
# Stage 1 - Base
############################################################
FROM node:22-bookworm-slim AS base

WORKDIR /app

############################################################
# Stage 2 - Builder (Prune Monorepo)
############################################################
FROM base AS builder

COPY . .

RUN npx turbo prune @hq/web --docker

############################################################
# Stage 3 - Installer & Build Next.js
############################################################
FROM base AS installer

WORKDIR /app

# Copy pruned json package manifests
COPY --from=builder /app/out/json/ ./
COPY --from=builder /app/out/yarn.lock ./yarn.lock

# Configure official npm registry & install dependencies
RUN yarn config set registry https://registry.npmjs.org/ \
    && yarn config set network-timeout 300000 \
    && yarn install --prefer-offline --no-lockfile --ignore-engines \
    && yarn cache clean

# Copy full pruned workspace source
COPY --from=builder /app/out/full/ ./

# Build argument for Next.js static bundling
ARG NEXT_PUBLIC_API_URL=https://api.hq.netify.ng
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build Next.js App
RUN yarn workspace @hq/web build

############################################################
# Stage 4 - Runtime (Standalone Next.js Runner < 180MB)
############################################################
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN groupadd --system nodejs \
    && useradd --system --gid nodejs --create-home nextjs

# Copy standalone server, static assets, and public directory
COPY --from=installer --chown=nestjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nestjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nestjs:nodejs /app/apps/web/public ./apps/web/public

USER nestjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
