FROM node:24-alpine AS base

# This Dockerfile is copy-pasted into our main docs at /docs/handbook/deploying-with-docker.
# Make sure you update both files!

FROM base AS installer
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune portal --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=installer /app/out/json/ .
COPY --from=installer /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=installer /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install bun for building with the bun adapter
RUN apk add --no-cache curl bash && \
    curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"


RUN corepack enable
RUN npm -g install corepack@latest
RUN corepack enable
RUN pnpm install  --frozen-lockfile

# Build the project
COPY --from=installer /app/out/full/ .

# Only the context path is required during build
ARG CONTEXT_PATH
ENV CONTEXT_PATH=$CONTEXT_PATH

RUN touch ./apps/portal/.env.local
RUN echo CONTEXT_PATH=$CONTEXT_PATH >> ./apps/portal/.env.local
RUN npm -g install corepack@latest
RUN corepack enable
RUN pnpm run build --filter portal

FROM oven/bun:1-alpine AS runner
ENV NODE_ENV=production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p /app
RUN chown -R nextjs:nodejs /app

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next-template /app/.next-template
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/server /app/server
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/package.prod.json package.json

RUN bun install

USER nextjs

EXPOSE 3000

CMD ["bun", "--bun", "/app/server/start.js"]
