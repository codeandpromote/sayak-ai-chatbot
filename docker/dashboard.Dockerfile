# ─── Stage 1: Build ────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy workspace config and package manifests
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/dashboard/package.json packages/dashboard/
COPY packages/shared/package.json packages/shared/

# Install all dependencies (dev included for build)
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source files
COPY packages/shared/ packages/shared/
COPY packages/dashboard/ packages/dashboard/

# Build shared package first, then dashboard
RUN cd packages/shared && pnpm build
RUN cd packages/dashboard && pnpm build

# ─── Stage 2: Production ──────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Security: non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Next.js standalone output includes its own node_modules
# Copy the standalone build and static assets
COPY --from=builder /app/packages/dashboard/.next/standalone ./
COPY --from=builder /app/packages/dashboard/.next/static ./packages/dashboard/.next/static
COPY --from=builder /app/packages/dashboard/public ./packages/dashboard/public

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/ || exit 1

USER appuser
EXPOSE 3001

CMD ["node", "packages/dashboard/server.js"]
