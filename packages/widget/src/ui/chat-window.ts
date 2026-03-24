import { WidgetConfig } from '../widget';
import { MessageRenderer } from './message-renderer';
import { LeadForm } from './lead-form';
import { AppointmentPicker } from './appointment-picker';

interface ChatCallbacks {
  onSendMessage: (content: string) => void;
  onClose: () => void;
  onLeadSubmit: (data: { name: string; email: string; phone?: string }) => void;
  onAppointmentBook: (data: { visitorName: string; visitorEmail: string; startTime: string }) => void;
}

export class ChatWindow {
  private container: HTMLElement | null = null;
  private messagesContainer: HTMLElement | null = null;
  private input: HTMLInputElement | null = null;
  private messageRenderer: MessageRenderer;
  private leadForm: LeadForm;
  private appointmentPicker: AppointmentPicker;
  private messageCounter = 0;

  constructor(private root: HTMLElement, private config: WidgetConfig, private callbacks: ChatCallbacks) {
    this.messageRenderer = new MessageRenderer(config);
    this.leadForm = new LeadForm(callbacks.onLeadSubmit);
    this.appointmentPicker = new AppointmentPicker(config.chatbotId, callbacks.onAppointmentBook);
  }

  render() {
    const position = this.config.widgetPosition === 'bottom-left' ? 'left' : 'right';
    this.container = document.createElement('div');
    this.container.className = `chatbot-window ${position}`;
    this.container.innerHTML = `
      <div class="chatbot-header" style="background-color:${this.config.primaryColor}">
        <div class="chatbot-header-info">
          ${this.config.avatarUrl ? `<img src="${this.config.avatarUrl}" class="chatbot-avatar" alt=""/>` : ''}
          <span class="chatbot-name">${this.esc(this.config.name)}</span>
        </div>
        <button class="chatbot-close" aria-label="Close chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="chatbot-messages"></div>
      <div class="chatbot-forms-container"></div>
      <div class="chatbot-input-container">
        <input type="text" class="chatbot-input" placeholder="${this.esc(this.config.placeholderText)}" />
        <button class="chatbot-send" style="color:${this.config.primaryColor}" aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      ${!this.config.removeBranding ? '<div class="chatbot-branding">Powered by AI Chatbot</div>' : ''}
    `;

    this.container.querySelector('.chatbot-close')?.addEventListener('click', () => this.callbacks.onClose());
    this.messagesContainer = this.container.querySelector('.chatbot-messages') as HTMLElement;
    this.input = this.container.querySelector('.chatbot-input') as HTMLInputElement;

    this.input?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && this.input?.value.trim()) {
        this.callbacks.onSendMessage(this.input.value.trim());
        this.input.value = '';
      }
    });
    this.container.querySelector('.chatbot-send')?.addEventListener('click', () => {
      if (this.input?.value.trim()) {
        this.callbacks.onSendMessage(this.input.value.trim());
        this.input.value = '';
      }
    });
    this.root.appendChild(this.container);
  }

  show() { this.container?.classList.add('visible'); this.input?.focus(); }
  hide() { this.container?.classList.remove('visible'); }

  addMessage(role: 'user' | 'assistant' | 'system' | 'agent', content: string): string {
    if (!this.messagesContainer) return '';
    const id = `msg-${++this.messageCounter}`;
    this.messagesContainer.appendChild(this.messageRenderer.render(id, role, content));
    this.scrollToBottom();
    return id;
  }

  updateMessage(id: string, content: string) {
    const el = this.messagesContainer?.querySelector(`[data-message-id="${id}"] .message-content`);
    if (el) { el.textContent = content; this.scrollToBottom(); }
  }

  showTyping() {
    if (!this.messagesContainer) return;
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.id = 'typing-indicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    this.messagesContainer.appendChild(typing);
    this.scrollToBottom();
  }

  hideTyping() { this.messagesContainer?.querySelector('#typing-indicator')?.remove(); }

  showLeadForm() {
    const c = this.container?.querySelector('.chatbot-forms-container');
    if (c) { c.innerHTML = ''; c.appendChild(this.leadForm.render()); }
  }

  showAppointmentPicker() {
    const c = this.container?.querySelector('.chatbot-forms-container');
    if (c) { c.innerHTML = ''; c.appendChild(this.appointmentPicker.render()); }
  }

  private scrollToBottom() {
    if (this.messagesContainer) this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  private esc(str: string): string {
    const div = document.createElement('div'); div.textContent = str; return div.innerHTML;
  }
}
