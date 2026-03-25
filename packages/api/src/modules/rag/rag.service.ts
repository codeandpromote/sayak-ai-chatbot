import { Injectable, Logger } from '@nestjs/common';
import { VectorStoreService } from './vector-store.service';
import { LlmFactoryService } from './llm/llm-factory.service';
import { AiMasksService } from '../ai-masks/ai-masks.service';
import { PrismaService } from '../../prisma/prisma.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { HumanMessage, AIMessage, SystemMessage } = require('@langchain/core/messages');

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant for {business_name}.
Answer questions based on the provided context. If you cannot find the answer in the context,
say so honestly and offer to help in another way.

{persona_instructions}

Context from knowledge base:
{context}

{lead_instructions}
{appointment_instructions}`;

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private vectorStore: VectorStoreService,
    private llmFactory: LlmFactoryService,
    private aiMasks: AiMasksService,
    private prisma: PrismaService,
  ) {}

  async *generateStreamingResponse(params: {
    chatbotId: string;
    query: string;
    conversationHistory: { role: string; content: string }[];
  }): AsyncGenerator<string> {
    const chatbot = await this.prisma.chatbot.findUnique({
      where: { id: params.chatbotId },
      include: { tenant: { select: { name: true } }, leadFormConfig: true, bookingConfig: true },
    });

    if (!chatbot) {
      yield 'Sorry, this chatbot is not available.';
      return;
    }

    // 1. Retrieve relevant context from vector store
    const relevantChunks = await this.vectorStore.similaritySearch(params.query, params.chatbotId, 5);
    const context = relevantChunks.map((chunk) => chunk.content).join('\n\n---\n\n');

    // 2. Get AI mask / persona
    const maskPrompt = await this.aiMasks.getSystemPrompt(params.chatbotId);

    // 3. Build lead capture instructions
    let leadInstructions = '';
    if (chatbot.leadCaptureEnabled && chatbot.leadFormConfig) {
      leadInstructions = `If you cannot answer the user's question from the context, politely ask for their contact information so a team member can follow up. Use "TRIGGER_LEAD_FORM" on a new line when you want to show the lead capture form.`;
    }

    // 4. Build appointment instructions
    let appointmentInstructions = '';
    if (chatbot.appointmentEnabled && chatbot.bookingConfig) {
      appointmentInstructions = `If the user wants to schedule a meeting or appointment, use "TRIGGER_APPOINTMENT_FORM" on a new line to show the booking widget.`;
    }

    // 5. Build the prompt
    const personaInstructions = maskPrompt || 'Be professional and helpful.';
    const systemPrompt = DEFAULT_SYSTEM_PROMPT
      .replace('{business_name}', chatbot.tenant.name)
      .replace('{persona_instructions}', personaInstructions)
      .replace('{context}', context || 'No relevant context found.')
      .replace('{lead_instructions}', leadInstructions)
      .replace('{appointment_instructions}', appointmentInstructions);

    // 6. Build chat history messages
    const messages: any[] = [new SystemMessage(systemPrompt)];

    for (const msg of params.conversationHistory.slice(-10)) {
      if (msg.role === 'user') messages.push(new HumanMessage(msg.content));
      else if (msg.role === 'assistant') messages.push(new AIMessage(msg.content));
    }
    messages.push(new HumanMessage(params.query));

    // 7. Get LLM and stream response
    const llm = this.llmFactory.getModel(chatbot.llmProvider, chatbot.llmModel);

    try {
      const stream = await llm.stream(messages);
      for await (const chunk of stream) {
        const content = typeof chunk.content === 'string' ? chunk.content : '';
        if (content) yield content;
      }
    } catch (error: any) {
      this.logger.error(`LLM streaming error (${chatbot.llmProvider}/${chatbot.llmModel}): ${error?.message || error}`);
      // If primary provider fails, try fallback
      const fallbackLlm = this.llmFactory.getFallbackModel(chatbot.llmProvider);
      if (fallbackLlm) {
        this.logger.log(`Retrying with fallback provider...`);
        try {
          const fallbackStream = await fallbackLlm.stream(messages);
          for await (const chunk of fallbackStream) {
            const content = typeof chunk.content === 'string' ? chunk.content : '';
            if (content) yield content;
          }
          return;
        } catch (fallbackError: any) {
          this.logger.error(`Fallback LLM also failed: ${fallbackError?.message || fallbackError}`);
        }
      }
      yield 'I apologize, but I encountered an error processing your request. Please try again.';
    }
  }

  async generateResponse(params: {
    chatbotId: string;
    query: string;
    conversationHistory: { role: string; content: string }[];
  }): Promise<string> {
    let fullResponse = '';
    for await (const token of this.generateStreamingResponse(params)) {
      fullResponse += token;
    }
    return fullResponse;
  }
}
