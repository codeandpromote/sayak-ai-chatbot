export class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  connect(url: string, chatbotId: string, visitorId: string) {
    this.ws = new WebSocket(`${url}?chatbotId=${chatbotId}&visitorId=${visitorId}`);
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        (this.listeners.get(data.type) || []).forEach((handler) => handler(data));
      } catch { /* ignore */ }
    };
    this.ws.onclose = () => setTimeout(() => this.connect(url, chatbotId, visitorId), 3000);
  }

  on(event: string, handler: (data: any) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
  }

  send(event: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ type: event, ...data }));
  }

  disconnect() { this.ws?.close(); this.ws = null; }
}
