export interface Role {
  name: string
  users: number
  permissions: string[]
}

export interface Agent {
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER'
  status: 'active' | 'inactive'
}

export interface TemplateCategory {
  type: 'whatsapp' | 'email'
  count: number
}

export interface BusinessSettings {
  name: string
  primaryColor: string
  timezone: string
  currency: string
}

export interface UserProfile {
  name: string
  email: string
  role: string
  phone?: string
  timezone?: string
}

export * from './integrations'