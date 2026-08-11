############################################################
# Stage 1 - Base
############################################################
FROM node:22-bookworm-slim AS base

WORKDIR /app

RUN apt-get -o Acquire::Check-Valid-Until=false -o Acquire::Check-Date=false update \
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

# Configure official npm registry, extend timeouts & limit concurrency for Docker networking stability
RUN yarn config set registry https://registry.npmjs.org/ \
    && yarn config set network-timeout 600000 \
    && yarn config set network-concurrency 1 \
    && yarn install --frozen-lockfile --ignore-engines \
    && yarn cache clean

COPY --from=builder /app/out/full/ ./

RUN yarn workspace @hq/database prisma:generate

RUN yarn workspace @hq/api build


# Migration image: retains Prisma CLI
FROM installer AS migrator

CMD ["yarn", "workspace", "@hq/database", "prisma:migrate:deploy"]


# Production dependencies only
FROM installer AS production-installer

RUN yarn install --production=true --ignore-scripts

############################################################
# Stage 4 - Runtime
############################################################
FROM node:22-bookworm-slim AS runner

WORKDIR /app

RUN apt-get -o Acquire::Check-Valid-Until=false -o Acquire::Check-Date=false update \
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
COPY --chown=nestjs:nodejs apps/api/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

USER nestjs

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "apps/api/dist/main.js"]