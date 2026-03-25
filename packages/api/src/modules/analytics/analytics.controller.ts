import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('summary')
  getSummary(@CurrentTenant() tenantId: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.analyticsService.getSummary(tenantId, from, to);
  }

  @Get('conversations')
  getConversationStats(@CurrentTenant() tenantId: string, @Query('days') days?: string) {
    return this.analyticsService.getConversationTimeSeries(tenantId, Number(days) || 30);
  }
}
