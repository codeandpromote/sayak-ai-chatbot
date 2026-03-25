import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
// BaseChatModel type — use any to avoid deep langchain type resolution issues
type BaseChatModel = any;
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

@Injectable()
export class LlmFactoryService {
  private readonly logger = new Logger(LlmFactoryService.name);
  private models: Map<string, BaseChatModel> = new Map();
  private embeddingModel: GoogleGenerativeAIEmbeddings;

  constructor(private config: ConfigService) {
    this.embeddingModel = new GoogleGenerativeAIEmbeddings({
      apiKey: this.config.get('GEMINI_API_KEY'),
      modelName: 'text-embedding-004',
    });
  }

  getModel(provider: string, modelName: string): BaseChatModel {
    const cacheKey = `${provider}:${modelName}`;
    if (this.models.has(cacheKey)) return this.models.get(cacheKey)!;

    let model: BaseChatModel;

    switch (provider) {
      case 'GEMINI':
        model = new ChatGoogleGenerativeAI({
          apiKey: this.config.get('GEMINI_API_KEY'),
          modelName: modelName || 'gemini-2.0-flash',
          maxOutputTokens: 1024,
          temperature: 0.7,
          streaming: true,
        });
        break;
      case 'GROQ':
        model = new ChatGroq({
          apiKey: this.config.get('GROQ_API_KEY'),
          modelName: modelName || 'llama-3.3-70b-versatile',
          maxTokens: 1024,
          temperature: 0.7,
          streaming: true,
        });
        break;
      default:
        this.logger.warn(`Unknown provider ${provider}, falling back to Gemini`);
        model = new ChatGoogleGenerativeAI({
          apiKey: this.config.get('GEMINI_API_KEY'),
          modelName: 'gemini-2.0-flash',
          maxOutputTokens: 1024,
          temperature: 0.7,
          streaming: true,
        });
    }

    this.models.set(cacheKey, model);
    return model;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const embedding = await this.embeddingModel.embedQuery(text);
    if (!embedding || embedding.length === 0) {
      throw new Error('Embedding generation returned empty result. Check GEMINI_API_KEY.');
    }
    return embedding;
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings = await this.embeddingModel.embedDocuments(texts);
    if (!embeddings || embeddings.length === 0 || embeddings[0].length === 0) {
      throw new Error('Embedding generation returned empty results. Check GEMINI_API_KEY.');
    }
    return embeddings;
  }
}
