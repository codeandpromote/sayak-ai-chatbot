import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.appointment.findMany({ where: { tenantId }, orderBy: { startTime: 'asc' } });
  }

  async book(dto: { chatbotId: string; visitorName: string; visitorEmail: string; visitorPhone?: string; startTime: string; notes?: string }) {
    const chatbot = await this.prisma.chatbot.findUnique({ where: { id: dto.chatbotId }, include: { bookingConfig: true } });
    if (!chatbot) throw new NotFoundException('Chatbot not found');
    if (!chatbot.bookingConfig) throw new BadRequestException('Booking not configured');

    const startTime = new Date(dto.startTime);
    const endTime = new Date(startTime.getTime() + chatbot.bookingConfig.slotDurationMin * 60000);

    const conflict = await this.prisma.appointment.findFirst({
      where: { chatbotId: dto.chatbotId, status: { in: ['PENDING', 'CONFIRMED'] }, OR: [{ startTime: { lt: endTime }, endTime: { gt: startTime } }] },
    });
    if (conflict) throw new BadRequestException('Time slot is no longer available');

    return this.prisma.appointment.create({ data: { tenantId: chatbot.tenantId, chatbotId: dto.chatbotId, visitorName: dto.visitorName, visitorEmail: dto.visitorEmail, visitorPhone: dto.visitorPhone, startTime, endTime, notes: dto.notes } });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.appointment.update({ where: { id }, data: { status: status as any } });
  }

  async upsertBookingConfig(tenantId: string, chatbotId: string, data: any) {
    const chatbot = await this.prisma.chatbot.findFirst({ where: { id: chatbotId, tenantId } });
    if (!chatbot) throw new NotFoundException('Chatbot not found');
    return this.prisma.bookingConfig.upsert({ where: { chatbotId }, create: { chatbotId, ...data }, update: data });
  }
}
