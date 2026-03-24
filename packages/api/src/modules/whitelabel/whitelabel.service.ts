import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WhitelabelService {
  constructor(private prisma: PrismaService) {}

  async get(tenantId: string) { return this.prisma.whitelabelConfig.findUnique({ where: { tenantId } }); }

  async upsert(tenantId: string, data: { removeBranding?: boolean; customCss?: string; customDomain?: string; faviconUrl?: string }) {
    return this.prisma.whitelabelConfig.upsert({ where: { tenantId }, create: { tenantId, ...data }, update: data });
  }
}
