import { Controller, Get, Post, Delete, Body, Param, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeService } from './knowledge.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { tmpdir } from 'os';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

// Stream file to disk, not memory — critical for 512MB RAM
const storage = diskStorage({
  destination: tmpdir(),
  filename: (_req, file, cb) => cb(null, `${uuid()}${extname(file.originalname)}`),
});

@Controller('chatbots/:chatbotId/knowledge')
@UseGuards(JwtAuthGuard, TenantGuard)
export class KnowledgeController {
  constructor(private knowledgeService: KnowledgeService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Param('chatbotId') chatbotId: string) {
    return this.knowledgeService.findAll(tenantId, chatbotId);
  }

  @Post('url')
  ingestUrl(
    @CurrentTenant() tenantId: string,
    @Param('chatbotId') chatbotId: string,
    @Body() dto: { url: string; name?: string },
  ) {
    return this.knowledgeService.ingestUrl(tenantId, chatbotId, dto.url, dto.name);
  }

  @Post('text')
  ingestText(
    @CurrentTenant() tenantId: string,
    @Param('chatbotId') chatbotId: string,
    @Body() dto: { text: string; name: string },
  ) {
    return this.knowledgeService.ingestText(tenantId, chatbotId, dto.text, dto.name);
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file', { storage, limits: { fileSize: 10 * 1024 * 1024 } }))
  ingestFile(
    @CurrentTenant() tenantId: string,
    @Param('chatbotId') chatbotId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.knowledgeService.ingestFile(tenantId, chatbotId, file);
  }

  @Delete(':sourceId')
  remove(
    @CurrentTenant() tenantId: string,
    @Param('chatbotId') chatbotId: string,
    @Param('sourceId') sourceId: string,
  ) {
    return this.knowledgeService.remove(tenantId, chatbotId, sourceId);
  }
}
