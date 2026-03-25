#!/bin/sh
set -e

echo "==> Setting up pgvector extension..."
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  await p.\$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector');
  console.log('pgvector extension ready');
  await p.\$disconnect();
})().catch(e => { console.error('pgvector setup error:', e.message); process.exit(1); });
"

echo "==> Running Prisma db push..."
npx prisma db push --skip-generate --accept-data-loss

echo "==> Adding pgvector embedding column..."
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  await p.\$executeRawUnsafe('ALTER TABLE \"DocumentChunk\" ADD COLUMN IF NOT EXISTS embedding vector(768)');
  await p.\$executeRawUnsafe('CREATE INDEX IF NOT EXISTS idx_chunk_embedding ON \"DocumentChunk\" USING hnsw (embedding vector_cosine_ops)');
  console.log('pgvector embedding column ready');

  // Re-embed any chunks that lost embeddings
  const nullChunks = await p.\$queryRawUnsafe('SELECT COUNT(*) as count FROM \"DocumentChunk\" WHERE embedding IS NULL');
  const count = Number(nullChunks[0].count);
  if (count > 0) {
    console.log('Found ' + count + ' chunks without embeddings, will re-embed on first request');
    // Mark their sources as needing re-embedding
    await p.\$executeRawUnsafe(
      'UPDATE \"KnowledgeSource\" SET status = \\\"PENDING\\\" WHERE id IN (SELECT DISTINCT \"knowledgeSourceId\" FROM \"DocumentChunk\" WHERE embedding IS NULL) AND status = \\\"COMPLETED\\\"'
    );
  }
  await p.\$disconnect();
})().catch(e => { console.error('pgvector column setup error:', e.message); process.exit(1); });
"

echo "==> Starting API server..."
exec node dist/main.js
