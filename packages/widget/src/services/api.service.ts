export class ApiService {
  public baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async getWidgetConfig(chatbotId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/widget/config/${chatbotId}`);
    if (!res.ok) throw new Error('Failed to load widget config');
    const json = await res.json();
    return json.data || json;
  }

  async submitLead(data: { chatbotId: string; conversationId?: string; name: string; email: string; phone?: string }): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/widget/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to submit lead');
  }

  async bookAppointment(data: { chatbotId: string; visitorName: string; visitorEmail: string; startTime: string }): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/widget/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to book appointment');
  }

  async getAvailability(chatbotId: string, date: string): Promise<{ slots: { start: string; end: string }[] }> {
    const res = await fetch(`${this.baseUrl}/api/widget/chatbots/${chatbotId}/availability?date=${date}`);
    if (!res.ok) throw new Error('Failed to get availability');
    const json = await res.json();
    return json.data || json;
  }
}
