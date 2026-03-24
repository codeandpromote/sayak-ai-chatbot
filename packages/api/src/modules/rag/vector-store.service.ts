import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmFactoryService } from './llm/llm-factory.service';

export interface ChunkResult {
  id: string;
  content: string;
  metadata: any;
  similarity: number;
}

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);

  constructor(
    private prisma: PrismaService,
    private llmFactory: LlmFactoryService,
  ) {}

  async similaritySearch(query: string, chatbotId: string, topK: number = 5): Promise<ChunkResult[]> {
    try {
      const embedding = await this.llmFactory.generateEmbedding(query);
      const embeddingStr = `[${embedding.join(',')}]`;

      const sources = await this.prisma.knowledgeSource.findMany({
        where: { chatbotId, status: 'COMPLETED' },
        select: { id: true },
      });
      if (sources.length === 0) return [];

      const sourceIds = sources.map((s) => s.id);

      const results = await this.prisma.$queryRawUnsafe<ChunkResult[]>(
        `SELECT dc.id, dc.content, dc.metadata,
                1 - (dc.embedding <=> $1::vector) as similarity
         FROM "DocumentChunk" dc
         WHERE dc."knowledgeSourceId" = ANY($2)
           AND dc.embedding IS NOT NULL
         ORDER BY dc.embedding <=> $1::vector
         LIMIT $3`,
        embeddingStr,
        sourceIds,
        topK,
      );
      return results;
    } catch (error) {
      this.logger.error(`Vector search failed: ${error}`);
      return [];
    }
  }

  async insertChunkWithEmbedding(chunkId: string, embedding: number[]): Promise<void> {
    const embeddingStr = `[${embedding.join(',')}]`;
    await this.prisma.$executeRawUnsafe(
      `UPDATE "DocumentChunk" SET embedding = $1::vector WHERE id = $2`,
      embeddingStr,
      chunkId,
    );
  }

  async deleteChunksBySourceId(sourceId: string): Promise<void> {
    await this.prisma.documentChunk.deleteMany({ where: { knowledgeSourceId: sourceId } });
  }
}
