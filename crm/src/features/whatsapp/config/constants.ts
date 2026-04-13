import type { WhatsAppConfigField } from '../types'

export const WHATSAPP_CONFIG_FIELDS: WhatsAppConfigField[] = [
  { key: 'baseUrl', label: 'API Base URL', placeholder: 'https://graph.facebook.com/v22.0', type: 'text', required: false },
  { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: '1023265770876372', type: 'text', required: true },
  { key: 'accessToken', label: 'Access Token', placeholder: 'EAAmC6O5Qmok...', type: 'password', required: true },
  { key: 'appSecret', label: 'App Secret', placeholder: 'Para verificar firma del webhook', type: 'password', required: true },
  { key: 'webhookVerifyToken', label: 'Webhook Verify Token', placeholder: 'Tu token personalizado', type: 'text', required: true },
  { key: 'wabaId', label: 'WABA ID (opcional)', placeholder: '1842664289565674', type: 'text', required: false },
]

export const DEFAULT_WHATSAPP_CONFIG = {
  baseUrl: 'https://graph.facebook.com/v22.0',
  phoneNumberId: '',
  accessToken: '',
  appSecret: '',
  webhookVerifyToken: '',
  wabaId: '',
}

export const WHATSAPP_API_BASE = 'https://graph.facebook.com/v22.0'