import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatHistoryService } from './chat-history.service';
import { RagModule } from '../rag/rag.module';
import { LeadsModule } from '../leads/leads.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { HandoffModule } from '../handoff/handoff.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [RagModule, LeadsModule, AppointmentsModule, HandoffModule, AnalyticsModule, TenantsModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, ChatHistoryService],
  exports: [ChatService],
})
export class ChatModule {}
