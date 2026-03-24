import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HandoffService } from './handoff.service';

@WebSocketGateway({ namespace: '/handoff', cors: { origin: '*' } })
export class HandoffGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private handoffService: HandoffService) {}

  handleConnection(client: Socket) {
    const tenantId = client.handshake.query.tenantId as string;
    if (tenantId) client.join(`tenant:${tenantId}`);
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('agent:message')
  async handleAgentMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string; content: string; agentId: string }) {
    this.server.to(`conversation:${data.conversationId}`).emit('message', { role: 'agent', content: data.content, createdAt: new Date() });
  }

  notifyNewHandoff(tenantId: string, session: any) {
    this.server.to(`tenant:${tenantId}`).emit('handoff:new', session);
  }
}
