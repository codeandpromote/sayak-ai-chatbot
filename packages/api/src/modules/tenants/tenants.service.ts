import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    return this.prisma.tenant.update({ where: { id }, data: dto });
  }

  async checkMessageQuota(tenantId: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { messagesUsed: true, monthlyMessageQuota: true },
    });
    if (!tenant) return false;
    return tenant.messagesUsed < tenant.monthlyMessageQuota;
  }

  async incrementMessageCount(tenantId: string) {
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { messagesUsed: { increment: 1 } },
    });
  }
}
