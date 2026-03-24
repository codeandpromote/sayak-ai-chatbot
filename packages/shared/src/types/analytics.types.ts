export interface AnalyticsEvent {
  id: string;
  chatbotId: string;
  eventType: string;
  visitorId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface AnalyticsSummary {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  leadsGenerated: number;
  appointmentsBooked: number;
  handoffCount: number;
  topQuestions: { question: string; count: number }[];
}
