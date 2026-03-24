import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async getAvailableSlots(chatbotId: string, dateStr: string) {
    const config = await this.prisma.bookingConfig.findUnique({ where: { chatbotId } });
    if (!config) throw new NotFoundException('Booking not configured');

    const date = new Date(dateStr);
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayName = dayNames[date.getDay()];
    const schedule = config.weeklySchedule as Record<string, { start: string; end: string }[]>;
    const daySchedule = schedule[dayName] || [];
    if (daySchedule.length === 0) return { slots: [] };

    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);

    const existingAppointments = await this.prisma.appointment.findMany({
      where: { chatbotId, status: { in: ['PENDING', 'CONFIRMED'] }, startTime: { gte: dayStart, lte: dayEnd } },
      select: { startTime: true, endTime: true },
    });

    const slots: { start: string; end: string }[] = [];
    for (const block of daySchedule) {
      const [startH, startM] = block.start.split(':').map(Number);
      const [endH, endM] = block.end.split(':').map(Number);
      let slotStart = new Date(date); slotStart.setHours(startH, startM, 0, 0);
      const blockEnd = new Date(date); blockEnd.setHours(endH, endM, 0, 0);

      while (slotStart.getTime() + config.slotDurationMin * 60000 <= blockEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + config.slotDurationMin * 60000);
        const isBooked = existingAppointments.some((apt) => apt.startTime < slotEnd && apt.endTime > slotStart);
        if (!isBooked) slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
        slotStart = new Date(slotEnd.getTime() + config.bufferMin * 60000);
      }
    }
    return { slots };
  }
}
