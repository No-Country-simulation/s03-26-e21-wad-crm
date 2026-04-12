/**
 * LocalStorage Wrapper with Type Safety
 * 
 * Handles config, templates, and CRM data persistence
 */

import { STORAGE_KEY, TEMPLATES_KEY, CRM_KEY, DEFAULT_CONFIG } from './constants'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WhatsAppConfig {
  baseUrl: string
  phoneNumberId: string
  accessToken: string
  appSecret: string
  webhookVerifyToken: string
  wabaId?: string
}

export interface WhatsAppTemplate {
  id: string
  name: string
  category: string
  language: string
  components: {
    type: 'header' | 'body' | 'footer' | 'buttons'
    text?: string
    parameters?: any[]
  }[]
  createdAt: string
  updatedAt?: string
}

export interface CRMConfig {
  baseUrl?: string
  token?: string
  userId?: string
  workspaceId?: string
}

// ─── Config Storage ───────────────────────────────────────────────────────────

/**
 * Load WhatsApp configuration from localStorage
 */
export function loadConfig(): WhatsAppConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.error('Error loading config:', err)
    return null
  }
}

/**
 * Save WhatsApp configuration to localStorage
 */
export function saveConfig(config: WhatsAppConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (err) {
    console.error('Error saving config:', err)
  }
}

/**
 * Clear WhatsApp configuration
 */
export function clearConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error('Error clearing config:', err)
  }
}

/**
 * Get config or return default
 */
export function getConfigOrDefault(): WhatsAppConfig {
  return loadConfig() || DEFAULT_CONFIG
}

// ─── Templates Storage ────────────────────────────────────────────────────────

/**
 * Load all templates from localStorage
 */
export function loadTemplates(): WhatsAppTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Error loading templates:', err)
    return []
  }
}

/**
 * Save all templates to localStorage
 */
export function saveTemplates(templates: WhatsAppTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
  } catch (err) {
    console.error('Error saving templates:', err)
  }
}

/**
 * Add a single template
 */
export function addTemplate(template: WhatsAppTemplate): WhatsAppTemplate[] {
  const templates = loadTemplates()
  templates.push(template)
  saveTemplates(templates)
  return templates
}

/**
 * Update a template by ID
 */
export function updateTemplate(id: string, updates: Partial<WhatsAppTemplate>): WhatsAppTemplate[] {
  const templates = loadTemplates()
  const index = templates.findIndex(t => t.id === id)
  if (index !== -1) {
    templates[index] = { ...templates[index], ...updates, updatedAt: new Date().toISOString() }
  }
  saveTemplates(templates)
  return templates
}

/**
 * Delete a template by ID
 */
export function deleteTemplate(id: string): WhatsAppTemplate[] {
  const templates = loadTemplates().filter(t => t.id !== id)
  saveTemplates(templates)
  return templates
}

/**
 * Find a template by ID
 */
export function getTemplateById(id: string): WhatsAppTemplate | undefined {
  return loadTemplates().find(t => t.id === id)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): WhatsAppTemplate[] {
  return loadTemplates().filter(t => t.category === category)
}

/**
 * Clear all templates
 */
export function clearTemplates(): void {
  try {
    localStorage.removeItem(TEMPLATES_KEY)
  } catch (err) {
    console.error('Error clearing templates:', err)
  }
}

// ─── CRM Config Storage ────────────────────────────────────────────────────────

/**
 * Load CRM configuration (backend URL, token, etc.)
 */
export function loadCrmConfig(): CRMConfig | null {
  try {
    const raw = localStorage.getItem(CRM_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.error('Error loading CRM config:', err)
    return null
  }
}

/**
 * Save CRM configuration
 */
export function saveCrmConfig(config: CRMConfig): void {
  try {
    localStorage.setItem(CRM_KEY, JSON.stringify(config))
  } catch (err) {
    console.error('Error saving CRM config:', err)
  }
}

/**
 * Update CRM config partially
 */
export function updateCrmConfig(updates: Partial<CRMConfig>): CRMConfig {
  const current = loadCrmConfig() || {}
  const merged = { ...current, ...updates }
  saveCrmConfig(merged)
  return merged
}

/**
 * Clear CRM configuration
 */
export function clearCrmConfig(): void {
  try {
    localStorage.removeItem(CRM_KEY)
  } catch (err) {
    console.error('Error clearing CRM config:', err)
  }
}

/**
 * Get CRM token
 */
export function getCrmToken(): string | undefined {
  return loadCrmConfig()?.token
}

/**
 * Get CRM base URL
 */
export function getCrmBaseUrl(): string | undefined {
  return loadCrmConfig()?.baseUrl
}

// ─── Session Management ──────────────────────────────────────────────────────

/**
 * Store user session data
 */
export function setSessionData(key: string, value: any): void {
  try {
    sessionStorage.setItem(`wa-session-${key}`, JSON.stringify(value))
  } catch (err) {
    console.error('Error storing session data:', err)
  }
}

/**
 * Get user session data
 */
export function getSessionData(key: string): any | null {
  try {
    const raw = sessionStorage.getItem(`wa-session-${key}`)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.error('Error loading session data:', err)
    return null
  }
}

/**
 * Clear session data
 */
export function clearSessionData(key?: string): void {
  try {
    if (key) {
      sessionStorage.removeItem(`wa-session-${key}`)
    } else {
      const keysToRemove: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key?.startsWith('wa-session-')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(k => sessionStorage.removeItem(k))
    }
  } catch (err) {
    console.error('Error clearing session data:', err)
  }
}

// ─── Batch Operations ────────────────────────────────────────────────────────

/**
 * Clear ALL WhatsApp CRM data (both localStorage and sessionStorage)
 */
export function clearAllData(): void {
  clearConfig()
  clearTemplates()
  clearCrmConfig()
  clearSessionData()
}

/**
 * Export all data as JSON (for backup)
 */
export function exportAllData(): Record<string, any> {
  return {
    config: loadConfig(),
    templates: loadTemplates(),
    crmConfig: loadCrmConfig(),
  }
}

/**
 * Import data from JSON (restore from backup)
 */
export function importAllData(data: Record<string, any>): void {
  if (data.config) saveConfig(data.config)
  if (data.templates) saveTemplates(data.templates)
  if (data.crmConfig) saveCrmConfig(data.crmConfig)
}
