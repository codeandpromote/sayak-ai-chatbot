#!/bin/sh
set -e

echo "==> Running Prisma db push..."
npx prisma db push --skip-generate --accept-data-loss

echo "==> Adding pgvector embedding column..."
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  await p.\$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector');
  await p.\$executeRawUnsafe('ALTER TABLE \"DocumentChunk\" ADD COLUMN IF NOT EXISTS embedding vector(768)');
  await p.\$executeRawUnsafe('CREATE INDEX IF NOT EXISTS idx_chunk_embedding ON \"DocumentChunk\" USING hnsw (embedding vector_cosine_ops)');
  console.log('pgvector embedding column ready');
  await p.\$disconnect();
})().catch(e => { console.error('pgvector setup error:', e.message); process.exit(1); });
"

echo "==> Starting API server..."
exec node dist/main.js
