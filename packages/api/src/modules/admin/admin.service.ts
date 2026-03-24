import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateTenantAdminDto } from './dto/update-tenant-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── PLATFORM STATS ──────────────────────────────────

  async getPlatformStats() {
    const [totalTenants, totalUsers, totalChatbots, totalConversations, totalMessages, totalLeads] =
      await Promise.all([
        this.prisma.tenant.count(),
        this.prisma.user.count(),
        this.prisma.chatbot.count(),
        this.prisma.conversation.count(),
        this.prisma.message.count(),
        this.prisma.lead.count(),
      ]);

    const tenantsByPlan = await this.prisma.tenant.groupBy({
      by: ['plan'],
      _count: { id: true },
    });

    const tenantsByStatus = await this.prisma.tenant.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const recentTenants = await this.prisma.tenant.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true, plan: true, createdAt: true },
    });

    return {
      totalTenants,
      totalUsers,
      totalChatbots,
      totalConversations,
      totalMessages,
      totalLeads,
      tenantsByPlan: tenantsByPlan.reduce(
        (acc, t) => ({ ...acc, [t.plan]: t._count.id }),
        {},
      ),
      tenantsByStatus: tenantsByStatus.reduce(
        (acc, t) => ({ ...acc, [t.status]: t._count.id }),
        {},
      ),
      recentTenants,
    };
  }

  // ─── TENANT MANAGEMENT ───────────────────────────────

  async listTenants(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { users: true, chatbots: true } },
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return { tenants, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          include: { user: { select: { id: true, email: true, name: true, isActive: true } } },
        },
        _count: { select: { chatbots: true, leads: true, appointments: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updateTenant(id: string, dto: UpdateTenantAdminDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    return this.prisma.tenant.update({ where: { id }, data: dto as any });
  }

  async deleteTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    await this.prisma.tenant.delete({ where: { id } });
    return { message: 'Tenant deleted successfully' };
  }

  // ─── USER MANAGEMENT ─────────────────────────────────

  async listUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          isSuperAdmin: true,
          isActive: true,
          createdAt: true,
          tenants: {
            include: { tenant: { select: { id: true, name: true, slug: true } } },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        isSuperAdmin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        tenants: {
          include: { tenant: { select: { id: true, name: true, slug: true, plan: true } } },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: string, dto: UpdateUserAdminDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        isSuperAdmin: true,
        isActive: true,
      },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
