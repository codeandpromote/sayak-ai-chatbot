import { ChatWindow } from './ui/chat-window';
import { ApiService } from './services/api.service';
import { StorageService } from './services/storage.service';
import { ThemeApplier } from './utils/theme-applier';

export interface WidgetConfig {
  chatbotId: string;
  name: string;
  widgetPosition: string;
  primaryColor: string;
  welcomeMessage: string;
  placeholderText: string;
  avatarUrl?: string;
  leadCaptureEnabled: boolean;
  appointmentEnabled: boolean;
  handoffEnabled: boolean;
  removeBranding: boolean;
  customCss?: string;
}

export class Widget {
  private chatWindow: ChatWindow | null = null;
  private api: ApiService;
  private storage: StorageService;
  private config: WidgetConfig | null = null;
  private isOpen = false;
  private conversationId: string | null = null;

  constructor(
    private root: HTMLElement,
    private shadow: ShadowRoot,
    private chatbotId: string,
    private apiUrl?: string,
  ) {
    this.api = new ApiService(apiUrl || 'https://api.yourdomain.com');
    this.storage = new StorageService();
  }

  async init() {
    try {
      this.config = await this.api.getWidgetConfig(this.chatbotId);
      if (this.config.customCss) {
        const customStyle = document.createElement('style');
        customStyle.textContent = this.config.customCss;
        this.shadow.appendChild(customStyle);
      }
      ThemeApplier.apply(this.root, this.config);
      this.renderLauncher();
    } catch (error) {
      console.error('[AIChatbot] Failed to initialize:', error);
    }
  }

  private renderLauncher() {
    if (!this.config) return;
    const launcher = document.createElement('button');
    launcher.className = `chatbot-launcher ${this.config.widgetPosition === 'bottom-left' ? 'left' : 'right'}`;
    launcher.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" fill="white" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    launcher.style.backgroundColor = this.config.primaryColor;
    launcher.addEventListener('click', () => this.toggle());
    this.root.appendChild(launcher);
  }

  private toggle() {
    this.isOpen ? this.close() : this.open();
  }

  private open() {
    if (!this.config) return;
    this.isOpen = true;
    if (!this.chatWindow) {
      this.chatWindow = new ChatWindow(this.root, this.config, {
        onSendMessage: (content) => this.sendMessage(content),
        onClose: () => this.close(),
        onLeadSubmit: (data) => this.submitLead(data),
        onAppointmentBook: (data) => this.bookAppointment(data),
      });
      this.chatWindow.render();
      this.chatWindow.addMessage('assistant', this.config.welcomeMessage);
    }
    this.chatWindow.show();
    const launcher = this.root.querySelector('.chatbot-launcher') as HTMLElement;
    if (launcher) launcher.classList.add('open');
  }

  private close() {
    this.isOpen = false;
    this.chatWindow?.hide();
    const launcher = this.root.querySelector('.chatbot-launcher') as HTMLElement;
    if (launcher) launcher.classList.remove('open');
  }

  private async sendMessage(content: string) {
    if (!this.chatWindow || !this.config) return;
    this.chatWindow.addMessage('user', content);
    this.chatWindow.showTyping();

    try {
      const visitorId = this.storage.getVisitorId();
      const response = await fetch(`${this.api.baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatbotId: this.chatbotId, conversationId: this.conversationId, visitorId, content }),
      });

      if (!response.ok || !response.body) throw new Error('Failed to get response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      this.chatWindow.hideTyping();
      const messageId = this.chatWindow.addMessage('assistant', '');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        for (const line of text.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            switch (event.type) {
              case 'token':
                assistantMessage += event.data;
                this.chatWindow.updateMessage(messageId, assistantMessage);
                break;
              case 'done':
                this.conversationId = event.conversationId;
                break;
              case 'lead_form':
                this.chatWindow.showLeadForm();
                break;
              case 'appointment_form':
                this.chatWindow.showAppointmentPicker();
                break;
              case 'handoff':
                this.chatWindow.addMessage('system', 'Connecting you with a human agent...');
                break;
            }
          } catch { /* skip malformed JSON */ }
        }
      }
    } catch {
      this.chatWindow.hideTyping();
      this.chatWindow.addMessage('system', 'Unable to send message. Please try again.');
    }
  }

  private async submitLead(data: { name: string; email: string; phone?: string }) {
    try {
      await this.api.submitLead({ chatbotId: this.chatbotId, conversationId: this.conversationId || undefined, ...data });
      this.chatWindow?.addMessage('system', "Thank you! We'll be in touch soon.");
    } catch {
      this.chatWindow?.addMessage('system', 'Failed to submit. Please try again.');
    }
  }

  private async bookAppointment(data: { visitorName: string; visitorEmail: string; startTime: string }) {
    try {
      await this.api.bookAppointment({ chatbotId: this.chatbotId, ...data });
      this.chatWindow?.addMessage('system', 'Appointment booked successfully!');
    } catch {
      this.chatWindow?.addMessage('system', 'Failed to book. Please try again.');
    }
  }
}
