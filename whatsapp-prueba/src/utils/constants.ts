/**
 * Global Constants for WhatsApp CRM
 * 
 * - API endpoints and base URLs
 * - Storage keys for localStorage
 * - Tab definitions for routing
 * - Template categories and languages
 */

// ─── API Configuration ────────────────────────────────────────────────────────

export const API_BASE = '/api'

export const BACKEND_BASE = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ? 'https://nexo-crm-ns89.onrender.com'
  : 'http://localhost:8080'

// ─── Storage Keys ─────────────────────────────────────────────────────────────

export const STORAGE_KEY = 'wa-prueba-config'
export const TEMPLATES_KEY = 'wa-prueba-templates'
export const CRM_KEY = 'wa-prueba-crm'

// ─── Tab Navigation ──────────────────────────────────────────────────────────

export const TABS = {
  SEND: 'send',
  TEMPLATES: 'templates',
  CONFIG: 'config',
  CRM: 'crm',
  CONVERSATIONS: 'conversations',
  LOGS: 'logs',
  WEBHOOK: 'webhook',
} as const

export type TabKey = typeof TABS[keyof typeof TABS]

// ─── Template Configuration ─────────────────────────────────────────────────

export const TEMPLATE_CATEGORIES = [
  { value: 'MARKETING', label: 'Marketing', color: 'bg-purple-600' },
  { value: 'UTILITY', label: 'Utility', color: 'bg-blue-600' },
  { value: 'AUTHENTICATION', label: 'Authentication', color: 'bg-amber-600' },
  { value: 'SERVICE', label: 'Service', color: 'bg-green-600' },
] as const

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'en_US', label: 'English (US)' },
  { value: 'es_AR', label: 'Español (Argentina)' },
  { value: 'pt_BR', label: 'Português (Brasil)' },
] as const

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_CONFIG = {
  baseUrl: 'https://graph.facebook.com/v22.0',
  phoneNumberId: '',
  accessToken: '',
  appSecret: '',
  webhookVerifyToken: '',
  wabaId: '',
}

// ─── Polling ──────────────────────────────────────────────────────────────────

export const POLLING_INTERVAL_MS = 15_000 // 15 seconds
