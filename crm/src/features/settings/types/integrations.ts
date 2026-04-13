// Basado en el servidor: SettingsController.java
// Solo integraciones - expone estado sin tokens

export interface IntegrationsStatus {
  whatsapp: WhatsAppStatus | null
  email: EmailStatus | null
}

export interface WhatsAppStatus {
  connected: boolean
  phoneNumberId: string | null
  connectedAt: string | null
}

export interface EmailStatus {
  connected: boolean
  type: 'SMTP' | 'GMAIL' | null
  identifier: string | null // host SMTP o email de Gmail
}

// Request para configurar WhatsApp
// POST /api/settings/integrations/whatsapp
export interface WhatsAppConfigRequest {
  phoneNumberId: string
  accessToken: string
  webhookVerifyToken: string
  appSecret: string
}

// Request para configurar Email
// POST /api/settings/integrations/email
export interface EmailIntegrationRequest {
  type: 'SMTP' | 'GMAIL'
  // Solo para SMTP
  host?: string
  port?: number
  username?: string
  password?: string
  encryption?: 'NONE' | 'TLS' | 'SSL'
}

export interface EmailOAuthCallback {
  code: string
  state: string // workspaceId
}