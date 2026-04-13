// Types for settings
export interface BusinessSettings {
  name: string
  primaryColor: string
  timezone: string
  currency: string
}

export interface ProfileSettings {
  name: string
  email: string
  phone?: string
  timezone?: string
}

export * from './integrations'