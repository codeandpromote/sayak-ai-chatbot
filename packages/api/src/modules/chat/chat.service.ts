import { Injectable, Logger } from '@nestjs/common';
import { RagService } from '../rag/rag.service';
import { ChatHistoryService } from './chat-history.service';
import { HandoffService } from '../handoff/handoff.service';
import { EventTrackerService } from '../analytics/event-tracker.service';
import { TenantsService } from '../tenants/tenants.service';
import { PrismaService } from '../../prisma/prisma.service';

interface ChatEvent {
  type: 'token' | 'done' | 'error' | 'lead_form' | 'appointment_form' | 'handoff';
  data?: string;
  conversationId?: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private ragService: RagService,
    private chatHistory: ChatHistoryService,
    private handoffService: HandoffService,
    private eventTracker: EventTrackerService,
    private tenantsService: TenantsService,
    private prisma: PrismaService,
  ) {}

  async handleMessage(dto: {
    chatbotId: string;
    conversationId?: string;
    visitorId: string;
    content: string;
  }): Promise<{ conversationId: string; stream: AsyncGenerator<ChatEvent> }> {
    // 1. Get or create conversation
    const conversation = await this.chatHistory.getOrCreateConversation(
      dto.chatbotId,
      dto.visitorId,
      dto.conversationId,
    );

    // 2. Check if conversation is handed off
    if (conversation.status === 'HANDED_OFF') {
      return { conversationId: conversation.id, stream: this.handoffResponse() };
    }

    // 3. Check message quota
    const chatbot = await this.prisma.chatbot.findUnique({
      where: { id: dto.chatbotId },
      select: { tenantId: true },
    });

    if (chatbot) {
      const hasQuota = await this.tenantsService.checkMessageQuota(chatbot.tenantId);
      if (!hasQuota) {
        return { conversationId: conversation.id, stream: this.quotaExceededResponse() };
      }
      await this.tenantsService.incrementMessageCount(chatbot.tenantId);
    }

    // 4. Save user message
    await this.chatHistory.saveMessage(conversation.id, 'user', dto.content);

    // 5. Get conversation history
    const history = await this.chatHistory.getRecentMessages(conversation.id, 10);

    // 6. Track event
    await this.eventTracker.track(dto.chatbotId, 'message_sent', dto.visitorId);

    // 7. Generate streaming AI response
    const self = this;
    const stream = async function* (): AsyncGenerator<ChatEvent> {
      let fullResponse = '';

      for await (const token of self.ragService.generateStreamingResponse({
        chatbotId: dto.chatbotId,
        query: dto.content,
        conversationHistory: history.map((m) => ({ role: m.role, content: m.content })),
      })) {
        fullResponse += token;

        // Check for special triggers
        if (fullResponse.includes('TRIGGER_LEAD_FORM')) {
          yield { type: 'lead_form' };
          fullResponse = fullResponse.replace('TRIGGER_LEAD_FORM', '');
          continue;
        }
        if (fullResponse.includes('TRIGGER_APPOINTMENT_FORM')) {
          yield { type: 'appointment_form' };
          fullResponse = fullResponse.replace('TRIGGER_APPOINTMENT_FORM', '');
          continue;
        }

        yield { type: 'token', data: token };
      }

      // Save assistant response
      await self.chatHistory.saveMessage(conversation.id, 'assistant', fullResponse.trim());

      // Check if handoff keywords detected
      const handoffKeywords = ['speak to human', 'talk to agent', 'real person', 'human agent'];
      if (handoffKeywords.some((kw) => dto.content.toLowerCase().includes(kw))) {
        await self.handoffService.initiateHandoff(conversation.id, 'User requested human agent');
        yield { type: 'handoff' };
        await self.eventTracker.track(dto.chatbotId, 'handoff_initiated', dto.visitorId);
      }
    };

    return { conversationId: conversation.id, stream: stream() };
  }

  private async *handoffResponse(): AsyncGenerator<ChatEvent> {
    yield { type: 'token', data: 'You are currently connected to a human agent. Please wait for their response.' };
  }

  private async *quotaExceededResponse(): AsyncGenerator<ChatEvent> {
    yield { type: 'token', data: 'We apologize, but this chatbot has reached its message limit. Please try again later.' };
  }
}
