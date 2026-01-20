FROM node:24-alpine AS base


FROM base AS prepare

WORKDIR /app
RUN npm -g install turbo@2
COPY . .
RUN turbo prune data-service --docker


FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/pnpm-lock.yaml .
RUN npm install -g corepack@latest
RUN corepack enable
RUN pnpm install --frozen-lockfile
COPY --from=prepare /app/out/full/ .

RUN pnpm --filter data-service build

FROM oven/bun:alpine
WORKDIR /app

ENV NODE_ENV=production
ENV DATA_SERVICE_PORT=3000

RUN addgroup --system --gid 1001 data-service
RUN adduser --system --uid 1001 data-service

COPY  --from=builder --chown=data-service:data-service /app/services/data-service/app ./

VOLUME ["/app/logs", "/app/outputs"]

RUN bun install

COPY --from=builder --chown=data-service:data-service /app/services/data-service/node_modules/@packages ./node_modules/

RUN chown -R data-service:data-service /app

USER data-service

EXPOSE 3000



CMD ["bun", "run", "app.mjs"]