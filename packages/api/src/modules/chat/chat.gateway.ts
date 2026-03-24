import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    const chatbotId = client.handshake.query.chatbotId as string;
    const visitorId = client.handshake.query.visitorId as string;
    if (chatbotId && visitorId) {
      client.join(`visitor:${visitorId}`);
      client.data = { chatbotId, visitorId };
      client.emit('connection:ack', { status: 'connected' });
    }
  }

  handleDisconnect() {}

  @SubscribeMessage('chat:message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { content: string; conversationId?: string },
  ) {
    const { chatbotId, visitorId } = client.data;
    try {
      const result = await this.chatService.handleMessage({
        chatbotId, visitorId, conversationId: data.conversationId, content: data.content,
      });
      for await (const event of result.stream) {
        client.emit('chat:stream', event);
      }
      client.emit('chat:stream', { type: 'done', conversationId: result.conversationId });
    } catch {
      client.emit('chat:stream', { type: 'error', data: 'An error occurred processing your message' });
    }
  }
}
