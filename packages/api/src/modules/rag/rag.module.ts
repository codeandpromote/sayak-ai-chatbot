import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { VectorStoreService } from './vector-store.service';
import { LlmFactoryService } from './llm/llm-factory.service';
import { AiMasksModule } from '../ai-masks/ai-masks.module';

@Module({
  imports: [AiMasksModule],
  providers: [RagService, VectorStoreService, LlmFactoryService],
  exports: [RagService, VectorStoreService, LlmFactoryService],
})
export class RagModule {}
