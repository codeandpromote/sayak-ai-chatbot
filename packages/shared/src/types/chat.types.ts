export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  HANDED_OFF = 'HANDED_OFF',
  RESOLVED = 'RESOLVED',
  EXPIRED = 'EXPIRED',
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  AGENT = 'agent',
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  chatbotId: string;
  visitorId: string;
  status: ConversationStatus;
  startedAt: Date;
  lastMessageAt: Date;
}

export interface SendMessagePayload {
  chatbotId: string;
  conversationId?: string;
  visitorId: string;
  content: string;
}

export interface ChatStreamEvent {
  type: 'token' | 'done' | 'error' | 'lead_form' | 'appointment_form' | 'handoff';
  data: string | Record<string, unknown>;
}
