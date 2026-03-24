import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AiMasksService } from './ai-masks.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('chatbots/:chatbotId/ai-mask')
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
