import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WidgetService {
  constructor(private prisma: PrismaService) {}

  async getConfig(chatbotId: string) {
    const chatbot = await this.prisma.chatbot.findUnique({
      where: { id: chatbotId, isActive: true },
      select: {
        id: true, name: true, widgetPosition: true, primaryColor: true,
        welcomeMessage: true, placeholderText: true, avatarUrl: true,
        leadCaptureEnabled: true, appointmentEnabled: true, handoffEnabled: true,
        tenant: { select: { whitelabel: { select: { removeBranding: true, customCss: true } } } },
      },
    });
    if (!chatbot) throw new NotFoundException('Chatbot not found');
    return {
      chatbotId: chatbot.id, name: chatbot.name, widgetPosition: chatbot.widgetPosition,
      primaryColor: chatbot.primaryColor, welcomeMessage: chatbot.welcomeMessage,
      placeholderText: chatbot.placeholderText, avatarUrl: chatbot.avatarUrl,
      leadCaptureEnabled: chatbot.leadCaptureEnabled, appointmentEnabled: chatbot.appointmentEnabled,
      handoffEnabled: chatbot.handoffEnabled,
      removeBranding: chatbot.tenant.whitelabel?.removeBranding ?? false,
      customCss: chatbot.tenant.whitelabel?.customCss ?? null,
    };
  }
}
