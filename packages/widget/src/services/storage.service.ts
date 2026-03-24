export class StorageService {
  private visitorId: string;

  constructor() {
    this.visitorId = this.getOrCreateVisitorId();
  }

  getVisitorId(): string {
    return this.visitorId;
  }

  private getOrCreateVisitorId(): string {
    const key = 'ai_chatbot_visitor_id';
    let id = '';
    try { id = sessionStorage.getItem(key) || ''; } catch { /* unavailable */ }
    if (!id) {
      id = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      try { sessionStorage.setItem(key, id); } catch { /* ignore */ }
    }
    return id;
  }
}
