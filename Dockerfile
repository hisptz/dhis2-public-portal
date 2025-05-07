FROM --platform=linux/amd64 node:20-alpine AS base

# This Dockerfile is copy-pasted into our main docs at /docs/handbook/deploying-with-docker.
# Make sure you update both files!

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune portal --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN corepack enable
RUN yarn install --frozen-lockfile


# Build the project
COPY --from=builder /app/out/full/ .

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN
ARG CONTEXT_PATH
ENV CONTEXT_PATH=$CONTEXT_PATH

ARG DHIS2_BASE_URL
ENV DHIS2_BASE_URL=$DHIS2_BASE_URL

ARG DHIS2_BASE_PAT_TOKEN
ENV DHIS2_BASE_PAT_TOKEN=$DHIS2_BASE_PAT_TOKEN

RUN touch ./apps/portal/.env.local
RUN echo CONTEXT_PATH=$CONTEXT_PATH >> ./apps/portal/.env.local
RUN echo DHIS2_BASE_URL=$DHIS2_BASE_URL >> ./apps/portal/.env.local
RUN echo DHIS2_BASE_PAT_TOKEN=$DHIS2_BASE_PAT_TOKEN >> ./apps/portal/.env.local

RUN yarn portal run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production



# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/portal/next.config.ts .
COPY --from=installer /app/apps/portal/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/portal/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/portal/.next/static ./apps/portal/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/portal/public ./apps/portal/public

CMD node apps/portal/server.js
