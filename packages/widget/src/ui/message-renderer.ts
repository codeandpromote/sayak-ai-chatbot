import { WidgetConfig } from '../widget';

export class MessageRenderer {
  constructor(private config: WidgetConfig) {}

  render(id: string, role: string, content: string): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = `message message-${role}`;
    wrapper.setAttribute('data-message-id', id);

    if (role === 'system') {
      wrapper.innerHTML = `<div class="message-content system-message">${this.esc(content)}</div>`;
    } else {
      const isUser = role === 'user';
      wrapper.innerHTML = `<div class="message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}" ${isUser ? `style="background-color:${this.config.primaryColor}"` : ''}><div class="message-content">${this.esc(content)}</div></div>`;
    }
    return wrapper;
  }

  private esc(str: string): string {
    const div = document.createElement('div'); div.textContent = str; return div.innerHTML;
  }
}
