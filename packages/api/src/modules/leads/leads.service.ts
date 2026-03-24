import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where: { tenantId },
        orderBy: { capturedAt: 'desc' },
        skip, take: limit,
        include: { conversation: { select: { id: true, chatbot: { select: { name: true } } } } },
      }),
      this.prisma.lead.count({ where: { tenantId } }),
    ]);
    return { leads, total, page, totalPages: Math.ceil(total / limit) };
  }

  async capture(dto: { chatbotId: string; conversationId?: string; email?: string; name?: string; phone?: string; customFields?: Record<string, unknown> }) {
    const chatbot = await this.prisma.chatbot.findUnique({ where: { id: dto.chatbotId }, select: { tenantId: true } });
    if (!chatbot) throw new NotFoundException('Chatbot not found');
    return this.prisma.lead.create({
      data: { tenantId: chatbot.tenantId, conversationId: dto.conversationId, email: dto.email, name: dto.name, phone: dto.phone, customFields: (dto.customFields ?? undefined) as any },
    });
  }

  async upsertFormConfig(tenantId: string, chatbotId: string, data: { fields: any[]; triggerAfterMessages?: number; triggerOnKeywords?: string[] }) {
    const chatbot = await this.prisma.chatbot.findFirst({ where: { id: chatbotId, tenantId } });
    if (!chatbot) throw new NotFoundException('Chatbot not found');
    return this.prisma.leadFormConfig.upsert({
      where: { chatbotId },
      create: { chatbotId, fields: data.fields, triggerAfterMessages: data.triggerAfterMessages ?? 3, triggerOnKeywords: data.triggerOnKeywords ?? [] },
      update: { fields: data.fields, triggerAfterMessages: data.triggerAfterMessages, triggerOnKeywords: data.triggerOnKeywords },
    });
  }

  async getFormConfig(chatbotId: string) {
    return this.prisma.leadFormConfig.findUnique({ where: { chatbotId } });
  }
}
