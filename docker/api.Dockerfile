# ─── Stage 1: Build ────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/api/package.json packages/api/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile || pnpm install

COPY packages/shared/ packages/shared/
COPY packages/api/ packages/api/

RUN cd packages/api && npx prisma generate
RUN cd packages/shared && pnpm build
RUN cd packages/api && pnpm build

# ─── Stage 2: Production ───────────────────────
FROM node:20-alpine AS production

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

# Security: non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

COPY pnpm-workspace.yaml package.json ./
COPY packages/api/package.json packages/api/
COPY packages/shared/package.json packages/shared/

ENV NODE_ENV=production
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

COPY --from=builder /app/packages/api/dist packages/api/dist
COPY --from=builder /app/packages/api/prisma packages/api/prisma
COPY --from=builder /app/packages/api/node_modules/.prisma packages/api/node_modules/.prisma
COPY --from=builder /app/packages/shared/dist packages/shared/dist

# Memory optimization for Render Free (512MB RAM)
ENV NODE_OPTIONS="--max-old-space-size=384"
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

USER appuser
EXPOSE 3000

CMD ["sh", "-c", "cd packages/api && npx prisma migrate deploy && node dist/main.js"]
