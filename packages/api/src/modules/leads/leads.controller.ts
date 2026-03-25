import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller()
@UseGuards(JwtAuthGuard, TenantGuard)
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get('leads')
  findAll(@CurrentTenant() tenantId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.leadsService.findAll(tenantId, Number(page) || 1, Number(limit) || 20);
  }

  @Public()
  @Post('widget/leads')
  capture(@Body() dto: { chatbotId: string; conversationId?: string; email?: string; name?: string; phone?: string; customFields?: Record<string, unknown> }) {
    return this.leadsService.capture(dto);
  }

  @Post('chatbots/:chatbotId/lead-form-config')
  updateFormConfig(@CurrentTenant() tenantId: string, @Param('chatbotId') chatbotId: string, @Body() dto: { fields: any[]; triggerAfterMessages?: number; triggerOnKeywords?: string[] }) {
    return this.leadsService.upsertFormConfig(tenantId, chatbotId, dto);
  }
}
