import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiMasksService {
  constructor(private prisma: PrismaService) {}

  async get(tenantId: string, chatbotId: string) {
    await this.verifyChatbotOwnership(tenantId, chatbotId);
    return this.prisma.aIMask.findUnique({ where: { chatbotId } });
  }

  async upsert(tenantId: string, chatbotId: string, data: { personaName: string; personality: string; systemPrompt: string; responseStyle?: string; restrictions?: string }) {
    await this.verifyChatbotOwnership(tenantId, chatbotId);
    return this.prisma.aIMask.upsert({
      where: { chatbotId },
      create: { chatbotId, ...data },
      update: data,
    });
  }

  async getSystemPrompt(chatbotId: string): Promise<string | null> {
    const mask = await this.prisma.aIMask.findUnique({ where: { chatbotId } });
    return mask?.systemPrompt ?? null;
  }

  private async verifyChatbotOwnership(tenantId: string, chatbotId: string) {
    const chatbot = await this.prisma.chatbot.findFirst({ where: { id: chatbotId, tenantId } });
    if (!chatbot) throw new NotFoundException('Chatbot not found');
  }
}
