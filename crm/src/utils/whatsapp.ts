/**
 * Shared utilities for WhatsApp panels
 * Helper functions, constants, and localStorage management
 */

import axios from 'axios'

// ────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────────────────────

export const STORAGE_KEY = 'wa-prueba-config'
export const TEMPLATES_KEY = 'wa-prueba-templates'
export const CRM_KEY = 'wa-prueba-crm'
export const LOG_TYPES = {
  CONFIG: 'config',
  SEND: 'send',
  TEMPLATE: 'template',
  CRM: 'crm',
  WEBHOOK: 'webhook',
} as const

export const BACKEND_BASE = 
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'https://nexo-crm-ns89.onrender.com'
    : 'http://localhost:8080'

// ────────────────────────────────────────────────────────────────────────────
// CONFIG MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────

export function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveConfig(config: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

// ────────────────────────────────────────────────────────────────────────────
// TEMPLATE MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────

export function loadTemplates() {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveTemplates(templates: any[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
}

// ────────────────────────────────────────────────────────────────────────────
// TEXT UTILITIES
// ────────────────────────────────────────────────────────────────────────────

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function generateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function countVariables(text?: string): number {
  if (!text) return 0
  const matches = text.match(/\{\{(\d+)\}\}/g)
  if (!matches) return 0
  return Math.max(...matches.map((m) => parseInt(m.replace(/\{\{|\}\}/g, ''))))
}

export function renderPreview(text?: string): string {
  if (!text) return ''
  return text.replace(/\{\{(\d+)\}\}/g, (match) => {
    return `<span class="px-1.5 py-0.5 rounded bg-green-600/30 text-green-300 text-xs font-mono">${match}</span>`
  })
}

// ────────────────────────────────────────────────────────────────────────────
// API UTILITIES
// ────────────────────────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: BACKEND_BASE,
})

export interface ApiResult<T = unknown> {
  ok: boolean
  msg: string
  data?: T
}

export async function testMetaConnection(
  baseUrl: string,
  phoneNumberId: string,
  accessToken: string
): Promise<ApiResult> {
  if (!phoneNumberId || !accessToken) {
    return { ok: false, msg: 'Completá phoneNumberId y accessToken' }
  }

  try {
    const res = await axios.get(`${baseUrl}/${phoneNumberId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (res.data.error) {
      return { ok: false, msg: res.data.error.message }
    }
    return {
      ok: true,
      msg: `Conectado — ${res.data.display_phone_number || phoneNumberId}`,
    }
  } catch (err: any) {
    const msg = err.response?.data?.error?.message || err.message
    return { ok: false, msg }
  }
}
