import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('analytics')
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
