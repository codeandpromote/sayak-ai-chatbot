import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  // ─── LIST MEMBERS ────────────────────────────────────

  async listMembers(tenantId: string) {
    const members = await this.prisma.tenantUser.findMany({
      where: { tenantId },
      include: {
        user: {
          select: { id: true, email: true, name: true, avatarUrl: true, isActive: true, createdAt: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      email: m.user.email,
      name: m.user.name,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
      isActive: m.user.isActive,
      joinedAt: m.joinedAt,
    }));
  }

  // ─── INVITE MEMBER ───────────────────────────────────

  async inviteMember(tenantId: string, invitedByUserId: string, dto: InviteMemberDto) {
    // Check if user is already a member
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      const existingMembership = await this.prisma.tenantUser.findUnique({
        where: { userId_tenantId: { userId: existingUser.id, tenantId } },
      });
      if (existingMembership) {
        throw new ConflictException('User is already a member of this tenant');
      }
    }

    // Check if invitation already pending
    const existingInvite = await this.prisma.invitation.findUnique({
      where: { email_tenantId: { email: dto.email, tenantId } },
    });
    if (existingInvite && existingInvite.status === 'PENDING') {
      throw new ConflictException('An invitation is already pending for this email');
    }

    // Create or update invitation (7-day expiry)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.invitation.upsert({
      where: { email_tenantId: { email: dto.email, tenantId } },
      update: {
        role: dto.role as any,
        status: 'PENDING',
        invitedBy: invitedByUserId,
        expiresAt,
      },
      create: {
        email: dto.email,
        tenantId,
        role: dto.role as any,
        invitedBy: invitedByUserId,
        expiresAt,
      },
    });

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
    };
  }

  // ─── LIST INVITATIONS ────────────────────────────────

  async listInvitations(tenantId: string) {
    return this.prisma.invitation.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        sender: { select: { name: true, email: true } },
      },
    });
  }

  // ─── ACCEPT INVITATION ───────────────────────────────

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: { tenant: { select: { id: true, name: true, slug: true } } },
    });

    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Invitation is no longer valid');
    }
    if (invitation.expiresAt < new Date()) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Invitation has expired');
    }

    // Verify accepting user email matches invitation
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email !== invitation.email) {
      throw new ForbiddenException('This invitation was sent to a different email address');
    }

    // Create membership and mark invitation as accepted
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.tenantUser.create({
        data: {
          userId,
          tenantId: invitation.tenantId,
          role: invitation.role,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      });

      return invitation.tenant;
    });

    return { message: 'Invitation accepted', tenant: result };
  }

  // ─── CANCEL INVITATION ───────────────────────────────

  async cancelInvitation(tenantId: string, invitationId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, tenantId },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');

    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'CANCELLED' },
    });

    return { message: 'Invitation cancelled' };
  }

  // ─── UPDATE MEMBER ROLE ──────────────────────────────

  async updateMemberRole(
    tenantId: string,
    membershipId: string,
    callerUserId: string,
    dto: UpdateMemberRoleDto,
  ) {
    const membership = await this.prisma.tenantUser.findFirst({
      where: { id: membershipId, tenantId },
    });
    if (!membership) throw new NotFoundException('Member not found');

    // Prevent changing own role
    if (membership.userId === callerUserId) {
      throw new ForbiddenException('You cannot change your own role');
    }

    // Only OWNER can assign OWNER role
    if (dto.role === 'OWNER') {
      const callerMembership = await this.prisma.tenantUser.findUnique({
        where: { userId_tenantId: { userId: callerUserId, tenantId } },
      });
      if (callerMembership?.role !== 'OWNER') {
        throw new ForbiddenException('Only owners can assign the owner role');
      }
    }

    return this.prisma.tenantUser.update({
      where: { id: membershipId },
      data: { role: dto.role as any },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  // ─── REMOVE MEMBER ───────────────────────────────────

  async removeMember(tenantId: string, membershipId: string, callerUserId: string) {
    const membership = await this.prisma.tenantUser.findFirst({
      where: { id: membershipId, tenantId },
    });
    if (!membership) throw new NotFoundException('Member not found');

    // Prevent removing yourself
    if (membership.userId === callerUserId) {
      throw new ForbiddenException('You cannot remove yourself from the tenant');
    }

    // Prevent removing the last owner
    if (membership.role === 'OWNER') {
      const ownerCount = await this.prisma.tenantUser.count({
        where: { tenantId, role: 'OWNER' },
      });
      if (ownerCount <= 1) {
        throw new ForbiddenException('Cannot remove the last owner of the tenant');
      }
    }

    await this.prisma.tenantUser.delete({ where: { id: membershipId } });
    return { message: 'Member removed successfully' };
  }
}
