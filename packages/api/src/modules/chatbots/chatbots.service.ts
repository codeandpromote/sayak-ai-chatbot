import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';

@Injectable()
export class ChatbotsService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async create(tenantId: string, dto: CreateChatbotDto) {
    return this.prisma.chatbot.create({ data: { ...dto, tenantId } });
  }

  async findAll(tenantId: string) {
    return this.prisma.chatbot.findMany({
      where: { tenantId },
      include: { _count: { select: { conversations: true, knowledgeSources: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const chatbot = await this.prisma.chatbot.findFirst({
      where: { id, tenantId },
      include: {
        aiMask: true, leadFormConfig: true, bookingConfig: true,
        _count: { select: { conversations: true, knowledgeSources: true } },
      },
    });
    if (!chatbot) throw new NotFoundException('Chatbot not found');
    return chatbot;
  }

  async update(tenantId: string, id: string, dto: UpdateChatbotDto) {
    const chatbot = await this.prisma.chatbot.findFirst({ where: { id, tenantId } });
    if (!chatbot) throw new NotFoundException('Chatbot not found');
    return this.prisma.chatbot.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const chatbot = await this.prisma.chatbot.findFirst({ where: { id, tenantId } });
    if (!chatbot) throw new NotFoundException('Chatbot not found');
    await this.prisma.chatbot.delete({ where: { id } });
    return { deleted: true };
  }

  getEmbedCode(chatbotId: string) {
    const widgetUrl = this.config.get('WIDGET_CDN_URL', 'https://sayak-ai-chatbot-widget.vercel.app').replace(/\/+$/, '');
    const apiUrl = this.config.get('API_URL', 'https://sayak-ai-chatbot.onrender.com').replace(/\/+$/, '');
    return {
      embedCode: `<script>\n  (function(w,d,c){\n    w.AIChatbot=w.AIChatbot||{};\n    w.AIChatbot.id=c;\n    w.AIChatbot.apiUrl='${apiUrl}';\n    var s=d.createElement('script');\n    s.src='${widgetUrl}/widget.js';\n    s.async=true;\n    d.head.appendChild(s);\n  })(window,document,'${chatbotId}');\n</script>`,
    };
  }
}
