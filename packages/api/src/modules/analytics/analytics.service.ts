import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(tenantId: string, from?: string, to?: string) {
    const dateFilter: any = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    const chatbotIds = (await this.prisma.chatbot.findMany({ where: { tenantId }, select: { id: true } })).map((c) => c.id);

    const [conversations, messages, leads, appointments, handoffs] = await Promise.all([
      this.prisma.conversation.count({ where: { chatbotId: { in: chatbotIds }, ...(from ? { startedAt: dateFilter } : {}) } }),
      this.prisma.message.count({ where: { conversation: { chatbotId: { in: chatbotIds } }, ...(from ? { createdAt: dateFilter } : {}) } }),
      this.prisma.lead.count({ where: { tenantId, ...(from ? { capturedAt: dateFilter } : {}) } }),
      this.prisma.appointment.count({ where: { tenantId, ...(from ? { createdAt: dateFilter } : {}) } }),
      this.prisma.handoffSession.count({ where: { conversation: { chatbot: { tenantId } }, ...(from ? { createdAt: dateFilter } : {}) } }),
    ]);

    return {
      totalConversations: conversations, totalMessages: messages,
      avgMessagesPerConversation: conversations > 0 ? Math.round(messages / conversations) : 0,
      leadsGenerated: leads, appointmentsBooked: appointments, handoffCount: handoffs,
    };
  }

  async getConversationTimeSeries(tenantId: string, days: number) {
    const chatbotIds = (await this.prisma.chatbot.findMany({ where: { tenantId }, select: { id: true } })).map((c) => c.id);
    const since = new Date(); since.setDate(since.getDate() - days);
    return this.prisma.conversation.groupBy({ by: ['startedAt'], where: { chatbotId: { in: chatbotIds }, startedAt: { gte: since } }, _count: true });
  }
}
