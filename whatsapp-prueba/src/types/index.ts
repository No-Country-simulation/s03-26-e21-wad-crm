/**
 * WhatsApp CRM Types & Interfaces
 * Core types for the entire application
 */

// ────────────────────────────────────────────────────────────────────────────
// ENUMS & CONSTANTS
// ────────────────────────────────────────────────────────────────────────────

export const TABS = {
  SEND: 'send',
  TEMPLATES: 'templates',
  CONFIG: 'config',
  CRM: 'crm',
  CONVERSATIONS: 'conversations',
  LOGS: 'logs',
  WEBHOOK: 'webhook',
} as const;

export type TabKey = typeof TABS[keyof typeof TABS];

export const TEMPLATE_CATEGORIES = [
  { value: 'MARKETING', label: 'Marketing', color: 'bg-purple-600' },
  { value: 'UTILITY', label: 'Utility', color: 'bg-blue-600' },
  { value: 'AUTHENTICATION', label: 'Authentication', color: 'bg-amber-600' },
  { value: 'SERVICE', label: 'Service', color: 'bg-green-600' },
] as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number]['value'];

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'en_US', label: 'English (US)' },
  { value: 'es_AR', label: 'Español (Argentina)' },
  { value: 'pt_BR', label: 'Português (Brasil)' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['value'];

export const ROLES = {
  ADMIN: 'ADMIN',
  AGENT: 'AGENT',
  USER: 'USER',
  VIEWER: 'VIEWER',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

// ────────────────────────────────────────────────────────────────────────────
// CONFIG & SETTINGS
// ────────────────────────────────────────────────────────────────────────────

export interface WhatsAppConfig {
  baseUrl: string;
  phoneNumberId: string;
  accessToken: string;
  appSecret: string;
  webhookVerifyToken: string;
  wabaId: string;
}

export interface CrmConfig {
  baseUrl?: string;
}

export interface Settings {
  integrations?: {
    whatsapp?: WhatsAppConfig;
  };
}

// ────────────────────────────────────────────────────────────────────────────
// TEMPLATE TYPES
// ────────────────────────────────────────────────────────────────────────────

export interface TemplateComponent {
  type: 'header' | 'body' | 'footer' | 'buttons';
  parameters?: string[];
  text?: string;
  buttons?: TemplateButton[];
}

export interface TemplateButton {
  type: 'url' | 'phone_number' | 'quick_reply';
  text: string;
  url?: string;
  phone_number?: string;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  language: LanguageCode;
  components: TemplateComponent[];
  createdAt: string;
  updatedAt: string;
}

// ────────────────────────────────────────────────────────────────────────────
// MESSAGE & CONTACT TYPES
// ────────────────────────────────────────────────────────────────────────────

export interface Contact {
  id: string;
  name: string;
  phone: string;
}

export interface Message {
  id?: string;
  text: string;
  phone: string;
  templateId?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// CONVERSATION & LOCK TYPES
// ────────────────────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
}

export interface ConversationLock {
  conversationId: string;
  userId: string;
  userName: string;
  lockedAt: string;
}

// ────────────────────────────────────────────────────────────────────────────
// LOG TYPES
// ────────────────────────────────────────────────────────────────────────────

export interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: RoleType;
  action: string;
  details?: Record<string, unknown>;
}

// ────────────────────────────────────────────────────────────────────────────
// USER & SESSION TYPES
// ────────────────────────────────────────────────────────────────────────────

export interface UserSession {
  userId: string;
  workspaceId: string;
  role: RoleType;
  accessToken?: string;
  refreshToken?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// API RESPONSE TYPES
// ────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
