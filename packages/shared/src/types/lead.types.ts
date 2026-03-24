export interface Lead {
  id: string;
  tenantId: string;
  conversationId?: string;
  email?: string;
  name?: string;
  phone?: string;
  customFields?: Record<string, unknown>;
  capturedAt: Date;
}

export interface LeadFormField {
  name: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select';
  label: string;
  required: boolean;
  options?: string[];
}

export interface LeadFormConfig {
  fields: LeadFormField[];
  triggerAfterMessages: number;
  triggerOnKeywords: string[];
}
