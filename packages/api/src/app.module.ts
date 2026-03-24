import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { ChatbotsModule } from './modules/chatbots/chatbots.module';
import { ChatModule } from './modules/chat/chat.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { RagModule } from './modules/rag/rag.module';
import { AiMasksModule } from './modules/ai-masks/ai-masks.module';
import { LeadsModule } from './modules/leads/leads.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { HandoffModule } from './modules/handoff/handoff.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WidgetModule } from './modules/widget/widget.module';
import { WhitelabelModule } from './modules/whitelabel/whitelabel.module';
import { HealthModule } from './modules/health/health.module';
import { AdminModule } from './modules/admin/admin.module';
import { TeamModule } from './modules/team/team.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    ChatbotsModule,
    ChatModule,
    KnowledgeModule,
    RagModule,
    AiMasksModule,
    LeadsModule,
    AppointmentsModule,
    HandoffModule,
    AnalyticsModule,
    WidgetModule,
    WhitelabelModule,
    HealthModule,
    AdminModule,
    TeamModule,
  ],
})
export class AppModule {}
