import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AiMasksService } from './ai-masks.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('chatbots/:chatbotId/ai-mask')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AiMasksController {
  constructor(private aiMasksService: AiMasksService) {}

  @Get()
  get(@CurrentTenant() tenantId: string, @Param('chatbotId') chatbotId: string) {
    return this.aiMasksService.get(tenantId, chatbotId);
  }

  @Post()
  createOrUpdate(
    @CurrentTenant() tenantId: string,
    @Param('chatbotId') chatbotId: string,
    @Body() dto: { personaName: string; personality: string; systemPrompt: string; responseStyle?: string; restrictions?: string },
  ) {
    return this.aiMasksService.upsert(tenantId, chatbotId, dto);
  }
}
