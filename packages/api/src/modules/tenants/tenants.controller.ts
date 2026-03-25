import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('tenants')
@UseGuards(JwtAuthGuard, TenantGuard)
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('current')
  getCurrent(@CurrentTenant() tenantId: string) {
    return this.tenantsService.findById(tenantId);
  }

  @Patch('current')
  update(@CurrentTenant() tenantId: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(tenantId, dto);
  }
}
