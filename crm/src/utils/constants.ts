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
  DASHBOARD: 'dashboard',
  CONTACTS: 'contacts',
  DEALS: 'deals',
  TASKS: 'tasks',
  APPOINTMENTS: 'appointments',
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  METRICS: 'metrics',
  SETTINGS: 'settings',
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

// ─── Config Fields ────────────────────────────────────────────────────────────

export const WHATSAPP_CONFIG_FIELDS = [
  { key: 'baseUrl', label: 'API Base URL', placeholder: 'https://graph.facebook.com/v22.0', type: 'text' },
  { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: '1023265770876372', type: 'text' },
  { key: 'accessToken', label: 'Access Token', placeholder: 'EAAmC6O5Qmok...', type: 'password' },
  { key: 'appSecret', label: 'App Secret', placeholder: 'Para verificar firma del webhook', type: 'password' },
  { key: 'webhookVerifyToken', label: 'Webhook Verify Token', placeholder: 'Tu token personalizado', type: 'text' },
  { key: 'wabaId', label: 'WABA ID (opcional)', placeholder: '1842664289565674', type: 'text' },
] as const

// ─── Polling ──────────────────────────────────────────────────────────────────

export const POLLING_INTERVAL_MS = 15_000 // 15 seconds
