import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HandoffService {
  constructor(private prisma: PrismaService) {}

  async initiateHandoff(conversationId: string, reason: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    await this.prisma.conversation.update({ where: { id: conversationId }, data: { status: 'HANDED_OFF' } });
    return this.prisma.handoffSession.create({ data: { conversationId, reason } });
  }

  async getPendingSessions(tenantId: string) {
    return this.prisma.handoffSession.findMany({
      where: { agentId: null, resolvedAt: null, conversation: { chatbot: { tenantId } } },
      include: { conversation: { include: { messages: { orderBy: { createdAt: 'desc' }, take: 5 }, chatbot: { select: { name: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async claimSession(conversationId: string, agentId: string) {
    const session = await this.prisma.handoffSession.findUnique({ where: { conversationId } });
    if (!session) throw new NotFoundException('Handoff session not found');
    if (session.agentId) throw new BadRequestException('Session already claimed');
    return this.prisma.handoffSession.update({ where: { conversationId }, data: { agentId, claimedAt: new Date() } });
  }

  async resolveSession(conversationId: string) {
    await this.prisma.conversation.update({ where: { id: conversationId }, data: { status: 'RESOLVED', resolvedAt: new Date() } });
    return this.prisma.handoffSession.update({ where: { conversationId }, data: { resolvedAt: new Date() } });
  }
}
