import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ChatbotsService } from './chatbots.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';

@Controller('chatbots')
export class ChatbotsController {
  constructor(private chatbotsService: ChatbotsService) {}

  @Post()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateChatbotDto) {
    return this.chatbotsService.create(tenantId, dto);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.chatbotsService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.chatbotsService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateChatbotDto) {
    return this.chatbotsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.chatbotsService.remove(tenantId, id);
  }

  @Get(':id/embed-code')
  getEmbedCode(@Param('id') id: string) {
    return this.chatbotsService.getEmbedCode(id);
  }
}
