import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
// BaseChatModel type — use any to avoid deep langchain type resolution issues
type BaseChatModel = any;

@Injectable()
export class LlmFactoryService {
  private readonly logger = new Logger(LlmFactoryService.name);
  private models: Map<string, BaseChatModel> = new Map();
  private apiKey: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('GEMINI_API_KEY') || '';
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

  getFallbackModel(currentProvider: string): BaseChatModel | null {
    // If Gemini failed, try Groq; if Groq failed, try Gemini
    if (currentProvider === 'GEMINI' && this.config.get('GROQ_API_KEY')) {
      this.logger.log('Falling back to Groq');
      return this.getModel('GROQ', 'llama-3.3-70b-versatile');
    }
    if (currentProvider === 'GROQ' && this.config.get('GEMINI_API_KEY')) {
      this.logger.log('Falling back to Gemini');
      return this.getModel('GEMINI', 'gemini-2.0-flash');
    }
    return null;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const result = await this.callEmbeddingApi([text]);
    return result[0];
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return this.callEmbeddingApi(texts);
  }

  private async callEmbeddingApi(texts: string[]): Promise<number[][]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${this.apiKey}`;

    const requests = texts.map((text) => ({
      model: 'models/gemini-embedding-001',
      content: { parts: [{ text }] },
      outputDimensionality: 768,
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Embedding API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const embeddings = data.embeddings?.map((e: any) => e.values) || [];

    if (embeddings.length === 0 || embeddings[0].length === 0) {
      throw new Error('Embedding API returned empty results. Check GEMINI_API_KEY.');
    }

    this.logger.log(`Generated ${embeddings.length} embeddings (dim=${embeddings[0].length})`);
    return embeddings;
  }
}
