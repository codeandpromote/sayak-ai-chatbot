import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatHistoryService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateConversation(chatbotId: string, visitorId: string, conversationId?: string) {
    if (conversationId) {
      const existing = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
      if (existing) return existing;
    }
    return this.prisma.conversation.create({ data: { chatbotId, visitorId } });
  }

  async saveMessage(conversationId: string, role: string, content: string, metadata?: any) {
    const message = await this.prisma.message.create({
      data: { conversationId, role, content, metadata: metadata ?? undefined },
    });
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
    return message;
  }

  async getRecentMessages(conversationId: string, limit: number = 10) {
    return this.prisma.message
      .findMany({ where: { conversationId }, orderBy: { createdAt: 'desc' }, take: limit })
      .then((msgs) => msgs.reverse());
  }

  async getConversations(tenantId: string, chatbotId?: string, status?: string) {
    const where: any = { chatbot: { tenantId } };
    if (chatbotId) where.chatbotId = chatbotId;
    if (status) where.status = status;

    return this.prisma.conversation.findMany({
      where,
      include: {
        chatbot: { select: { name: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 50,
    });
  }

  async getMessages(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
