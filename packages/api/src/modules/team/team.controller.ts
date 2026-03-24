import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Controller('team')
@UseGuards(TenantGuard, RolesGuard)
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Get('members')
  listMembers(@CurrentTenant() tenantId: string) {
    return this.teamService.listMembers(tenantId);
  }

  @Post('invite')
  @Roles('OWNER', 'ADMIN')
  inviteMember(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.teamService.inviteMember(tenantId, userId, dto);
  }

  @Get('invitations')
  @Roles('OWNER', 'ADMIN')
  listInvitations(@CurrentTenant() tenantId: string) {
    return this.teamService.listInvitations(tenantId);
  }

  @Post('invitations/:token/accept')
  acceptInvitation(
    @Param('token') token: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.teamService.acceptInvitation(token, userId);
  }

  @Delete('invitations/:id')
  @Roles('OWNER', 'ADMIN')
  cancelInvitation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.teamService.cancelInvitation(tenantId, id);
  }

  @Patch('members/:id/role')
  @Roles('OWNER', 'ADMIN')
  updateMemberRole(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.teamService.updateMemberRole(tenantId, id, userId, dto);
  }

  @Delete('members/:id')
  @Roles('OWNER', 'ADMIN')
  removeMember(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.teamService.removeMember(tenantId, id, userId);
  }
}
