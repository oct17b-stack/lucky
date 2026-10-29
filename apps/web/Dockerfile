# 在仓库根目录构建：docker build -f apps/web/Dockerfile -t lucky-web .
# GitHub Actions 会同时构建 linux/amd64 和 linux/arm64，适配不同 CPU 的威联通 NAS。

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY packages/core/package.json packages/core/
COPY packages/content/package.json packages/content/
RUN pnpm install --filter web... --frozen-lockfile=false

FROM deps AS build
COPY packages ./packages
COPY apps/web ./apps/web
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG APP_ENV=staging
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL APP_ENV=$APP_ENV
RUN pnpm --filter web build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /repo/apps/web/.next/standalone ./
COPY --from=build --chown=app:app /repo/apps/web/.next/static ./apps/web/.next/static
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "apps/web/server.js"]
