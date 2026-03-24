import { Controller, Post, Param, Get } from '@nestjs/common';
import { HandoffService } from './handoff.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('handoff')
export class HandoffController {
  constructor(private handoffService: HandoffService) {}

  @Get('pending')
  getPending(@CurrentTenant() tenantId: string) { return this.handoffService.getPendingSessions(tenantId); }

  @Post(':conversationId/claim')
  claim(@Param('conversationId') conversationId: string, @CurrentUser('id') agentId: string) { return this.handoffService.claimSession(conversationId, agentId); }

  @Post(':conversationId/resolve')
  resolve(@Param('conversationId') conversationId: string) { return this.handoffService.resolveSession(conversationId); }
}
