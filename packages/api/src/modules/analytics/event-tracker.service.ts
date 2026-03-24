import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EventTrackerService {
  constructor(private prisma: PrismaService) {}

  async track(chatbotId: string, eventType: string, visitorId?: string, metadata?: Record<string, unknown>) {
    await this.prisma.analyticsEvent.create({ data: { chatbotId, eventType, visitorId, metadata: (metadata ?? undefined) as any } });
  }
}
