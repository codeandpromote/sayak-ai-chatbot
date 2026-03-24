export interface WidgetConfig {
  chatbotId: string;
  name: string;
  widgetPosition: 'bottom-right' | 'bottom-left';
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
