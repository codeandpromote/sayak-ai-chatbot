import { Controller, Post, Body, Res, Param, Get, Query, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatHistoryService } from './chat-history.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private chatHistory: ChatHistoryService,
  ) {}

  /** Public SSE streaming endpoint for the widget */
  @Public()
  @Post('message')
  async sendMessage(
    @Body() dto: { chatbotId: string; conversationId?: string; visitorId: string; content: string },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
      const result = await this.chatService.handleMessage(dto);
      for await (const event of result.stream) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ type: 'done', conversationId: result.conversationId })}\n\n`);
    } catch {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'An error occurred' })}\n\n`);
    }
    res.end();
  }

  /** Dashboard: list conversations */
  @Get('conversations')
  getConversations(
    @CurrentTenant() tenantId: string,
    @Query('chatbotId') chatbotId?: string,
    @Query('status') status?: string,
  ) {
    return this.chatHistory.getConversations(tenantId, chatbotId, status);
  }

  /** Dashboard: get conversation messages */
  @Get('conversations/:id/messages')
  getMessages(@Param('id') conversationId: string) {
    return this.chatHistory.getMessages(conversationId);
  }
}
