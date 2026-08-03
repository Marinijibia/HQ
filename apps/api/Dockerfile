############################################################
# Stage 1 - Base
############################################################
FROM node:22-bookworm-slim AS base

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends git openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

############################################################
# Stage 2 - Builder
############################################################
FROM base AS builder

COPY . .

RUN npx turbo prune @hq/api --docker

############################################################
# Stage 3 - Installer
############################################################
FROM base AS installer

WORKDIR /app

COPY --from=builder /app/out/json/ ./
COPY --from=builder /app/out/yarn.lock ./yarn.lock

# Configure official npm registry & install dependencies
RUN yarn config set registry https://registry.npmjs.org/ \
    && yarn config set network-timeout 300000 \
    && yarn install --prefer-offline --no-lockfile --ignore-engines \
    && yarn cache clean

COPY --from=builder /app/out/full/ ./

RUN yarn workspace @hq/database prisma:generate

RUN yarn workspace @hq/api build

RUN yarn install --production=true --ignore-scripts

############################################################
# Stage 4 - Runtime
############################################################
FROM node:22-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=5000

RUN groupadd --system nodejs \
    && useradd --system --gid nodejs --create-home nestjs

RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads /app

COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=installer --chown=nestjs:nodejs /app/packages/database ./packages/database
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json

USER nestjs

EXPOSE 5000

CMD ["node", "apps/api/dist/main.js"]