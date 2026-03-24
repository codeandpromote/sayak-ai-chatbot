# ─── Single-stage build for Render Free (512MB RAM) ────
FROM node:20-alpine

WORKDIR /app

# OpenSSL for Prisma on Alpine
RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@9 --activate

# Security: non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Install dependencies
COPY .npmrc pnpm-workspace.yaml package.json tsconfig.base.json pnpm-lock.yaml* ./
COPY packages/api/package.json packages/api/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile || pnpm install

# Copy source and build
COPY packages/shared/ packages/shared/
COPY packages/api/ packages/api/

RUN cd packages/api && npx prisma generate
RUN cd packages/shared && pnpm build
RUN cd packages/api && pnpm build

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=384"
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

USER appuser
EXPOSE 3000

CMD ["sh", "-c", "cd packages/api && npx prisma db push --skip-generate --accept-data-loss && node dist/main.js"]
