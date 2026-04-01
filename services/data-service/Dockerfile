FROM node:24-alpine AS base


FROM base AS prepare

WORKDIR /app
RUN npm -g install turbo@2
COPY . .
RUN turbo prune data-service --docker


FROM base AS builder
RUN apk add --no-cache libc6-compat curl bash
RUN apk update

RUN curl -fsSL https://bun.sh/install | bash

ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"
WORKDIR /app


COPY .gitignore .gitignore
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/pnpm-lock.yaml .
RUN npm install -g corepack@latest
RUN corepack enable
RUN pnpm install --frozen-lockfile
COPY --from=prepare /app/out/full/ .

RUN pnpm dlx prisma@7 generate --schema services/data-service/prisma/schema.prisma
RUN pnpm --filter data-service build

FROM oven/bun:alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DATA_SERVICE_PORT=3000

COPY  --from=builder --chown=data-service:data-service /app/services/data-service/app ./

RUN addgroup --system --gid 1001 data-service
RUN adduser --system --uid 1001 data-service

VOLUME ["/app/logs", "/app/outputs"]

RUN bun install

RUN chown -R data-service:data-service /app

USER data-service

EXPOSE 3000

CMD ["bun", "run", "app.js"]