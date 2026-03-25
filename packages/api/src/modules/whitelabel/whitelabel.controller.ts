import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { WhitelabelService } from './whitelabel.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('whitelabel')
@UseGuards(JwtAuthGuard, TenantGuard)
export class WhitelabelController {
  constructor(private whitelabelService: WhitelabelService) {}

  @Get()
  get(@CurrentTenant() tenantId: string) { return this.whitelabelService.get(tenantId); }

  @Post()
  upsert(@CurrentTenant() tenantId: string, @Body() dto: { removeBranding?: boolean; customCss?: string; customDomain?: string; faviconUrl?: string }) {
    return this.whitelabelService.upsert(tenantId, dto);
  }
}
