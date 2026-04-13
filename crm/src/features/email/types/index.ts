export interface EmailConfig {
  type: 'SMTP' | 'GMAIL'
  host?: string
  port?: number
  username?: string
  password?: string
  encryption?: 'NONE' | 'TLS' | 'SSL'
}

export interface EmailStatus {
  connected: boolean
  type: 'SMTP' | 'GMAIL' | null
  identifier: string | null // host SMTP o email de Gmail
}

export interface EmailConfigResponse {
  success: boolean
  type?: 'SMTP' | 'GMAIL'
  connected?: boolean
  host?: string
  email?: string
  authUrl?: string
  error?: string
}