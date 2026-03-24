import { Module } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { UrlScraperProcessor } from './processors/url-scraper.processor';
import { PdfParserProcessor } from './processors/pdf-parser.processor';
import { DocxParserProcessor } from './processors/docx-parser.processor';
import { TextParserProcessor } from './processors/text-parser.processor';
import { ChunkingService } from './chunking/chunking.service';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [RagModule],
  controllers: [KnowledgeController],
  providers: [
    KnowledgeService,
    UrlScraperProcessor,
    PdfParserProcessor,
    DocxParserProcessor,
    TextParserProcessor,
    ChunkingService,
  ],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
