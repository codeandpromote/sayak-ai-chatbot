import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UrlScraperProcessor } from './processors/url-scraper.processor';
import { PdfParserProcessor } from './processors/pdf-parser.processor';
import { DocxParserProcessor } from './processors/docx-parser.processor';
import { ChunkingService } from './chunking/chunking.service';
import { VectorStoreService } from '../rag/vector-store.service';
import { LlmFactoryService } from '../rag/llm/llm-factory.service';
import { unlink } from 'fs/promises';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private prisma: PrismaService,
    private urlScraper: UrlScraperProcessor,
    private pdfParser: PdfParserProcessor,
    private docxParser: DocxParserProcessor,
    private chunking: ChunkingService,
    private vectorStore: VectorStoreService,
    private llmFactory: LlmFactoryService,
  ) {}

  async findAll(tenantId: string, chatbotId: string) {
    await this.verifyChatbot(tenantId, chatbotId);
    return this.prisma.knowledgeSource.findMany({ where: { chatbotId }, orderBy: { createdAt: 'desc' } });
  }

  async ingestUrl(tenantId: string, chatbotId: string, url: string, name?: string) {
    await this.verifyChatbot(tenantId, chatbotId);
    const source = await this.prisma.knowledgeSource.create({
      data: { chatbotId, type: 'URL', name: name || url, sourceUrl: url, status: 'PROCESSING' },
    });
    this.processUrlIngestion(source.id, url).catch((err) =>
      this.logger.error(`URL ingestion failed for ${source.id}: ${err}`),
    );
    return source;
  }

  async ingestText(tenantId: string, chatbotId: string, text: string, name: string) {
    await this.verifyChatbot(tenantId, chatbotId);
    const source = await this.prisma.knowledgeSource.create({
      data: { chatbotId, type: 'TEXT', name, status: 'PROCESSING' },
    });
    this.processAndEmbedText(source.id, text).catch((err) =>
      this.logger.error(`Text ingestion failed for ${source.id}: ${err}`),
    );
    return source;
  }

  async ingestFile(tenantId: string, chatbotId: string, file: Express.Multer.File) {
    await this.verifyChatbot(tenantId, chatbotId);
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    let type: 'PDF' | 'DOCX';
    if (ext === 'pdf') type = 'PDF';
    else if (ext === 'docx' || ext === 'doc') type = 'DOCX';
    else throw new BadRequestException('Unsupported file type. Use PDF or DOCX.');

    const source = await this.prisma.knowledgeSource.create({
      data: { chatbotId, type, name: file.originalname, fileName: file.filename, fileSize: file.size, status: 'PROCESSING' },
    });
    this.processFileIngestion(source.id, file.path, type).catch((err) =>
      this.logger.error(`File ingestion failed for ${source.id}: ${err}`),
    );
    return source;
  }

  async remove(tenantId: string, chatbotId: string, sourceId: string) {
    await this.verifyChatbot(tenantId, chatbotId);
    const source = await this.prisma.knowledgeSource.findFirst({ where: { id: sourceId, chatbotId } });
    if (!source) throw new NotFoundException('Knowledge source not found');
    await this.vectorStore.deleteChunksBySourceId(sourceId);
    await this.prisma.knowledgeSource.delete({ where: { id: sourceId } });
    return { deleted: true };
  }

  private async processUrlIngestion(sourceId: string, url: string) {
    try {
      // Crawl the entire website (up to 20 pages), not just one page
      const text = await this.urlScraper.scrapeWebsite(url, 20);
      await this.processAndEmbedText(sourceId, text);
    } catch (error) {
      await this.markFailed(sourceId, error);
    }
  }

  private async processFileIngestion(sourceId: string, filePath: string, type: 'PDF' | 'DOCX') {
    try {
      const text = type === 'PDF' ? await this.pdfParser.parse(filePath) : await this.docxParser.parse(filePath);
      await this.processAndEmbedText(sourceId, text);
      await unlink(filePath).catch(() => {});
    } catch (error) {
      await this.markFailed(sourceId, error);
      await unlink(filePath).catch(() => {});
    }
  }

  private async processAndEmbedText(sourceId: string, text: string) {
    try {
      // 1. Chunk the text
      const chunks = await this.chunking.splitText(text);

      // 2. Create chunk records
      const chunkRecords = await Promise.all(
        chunks.map((chunk, index) =>
          this.prisma.documentChunk.create({
            data: {
              knowledgeSourceId: sourceId,
              content: chunk.content,
              metadata: chunk.metadata,
              chunkIndex: index,
              tokenCount: chunk.tokenCount,
            },
          }),
        ),
      );

      // 3. Generate embeddings in batches of 10 (memory-efficient)
      const BATCH_SIZE = 10;
      for (let i = 0; i < chunkRecords.length; i += BATCH_SIZE) {
        const batch = chunkRecords.slice(i, i + BATCH_SIZE);
        const texts = batch.map((c) => chunks[c.chunkIndex].content);
        const embeddings = await this.llmFactory.generateEmbeddings(texts);
        await Promise.all(
          batch.map((record, j) => this.vectorStore.insertChunkWithEmbedding(record.id, embeddings[j])),
        );
      }

      // 4. Mark as completed
      await this.prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { status: 'COMPLETED', chunkCount: chunkRecords.length },
      });
      this.logger.log(`Ingestion complete for ${sourceId}: ${chunkRecords.length} chunks`);
    } catch (error) {
      await this.markFailed(sourceId, error);
    }
  }

  private async markFailed(sourceId: string, error: unknown) {
    this.logger.error(`Ingestion error for ${sourceId}: ${error}`);
    await this.prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: { status: 'FAILED', errorMessage: String(error) },
    });
  }

  private async verifyChatbot(tenantId: string, chatbotId: string) {
    const chatbot = await this.prisma.chatbot.findFirst({ where: { id: chatbotId, tenantId } });
    if (!chatbot) throw new NotFoundException('Chatbot not found');
    return chatbot;
  }
}
