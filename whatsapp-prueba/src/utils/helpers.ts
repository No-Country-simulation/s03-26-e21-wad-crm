/**
 * Utility Helper Functions for WhatsApp CRM
 * 
 * - Date/time formatting
 * - ID generation
 * - Template variable parsing
 * - HTML/text rendering
 */

// ─── Date/Time Utilities ──────────────────────────────────────────────────────

/**
 * Format a date to HH:mm:ss in Argentina timezone
 */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * Format a date to a readable format
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a date to full datetime string
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return `${formatDate(d)} ${formatTime(d)}`
}

// ─── ID Generation ────────────────────────────────────────────────────────────

/**
 * Generate a unique ID for templates
 * Format: tpl_TIMESTAMP_RANDOM
 */
export function generateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// ─── Template Variable Processing ───────────────────────────────────────────

/**
 * Count the number of variables ({{1}}, {{2}}, etc.) in template text
 * Returns the highest variable index found
 */
export function countVariables(text: string | undefined): number {
  const matches = text?.match(/\{\{(\d+)\}\}/g)
  if (!matches) return 0
  return Math.max(...matches.map(m => parseInt(m.replace(/\{\{|\}\}/g, ''))))
}

/**
 * Replace template variables with actual values
 * {{1}} → value1, {{2}} → value2, etc.
 */
export function replaceVariables(text: string, values: string[]): string {
  let result = text
  values.forEach((val, i) => {
    result = result.replace(new RegExp(`\\{\\{${i + 1}\\}\\}`, 'g'), val)
  })
  return result
}

/**
 * Parse comma-separated template parameters into array
 */
export function parseTemplateParams(params: string): string[] {
  return params
    .split(',')
    .map(p => p.trim())
    .filter(Boolean)
}

// ─── HTML/Rendering Utilities ───────────────────────────────────────────────

/**
 * Render template variables as highlighted HTML spans
 * Used for template preview in UI
 */
export function renderPreview(text: string | undefined): string {
  if (!text) return ''
  return text.replace(/\{\{(\d+)\}\}/g, (match) => {
    return `<span class="px-1.5 py-0.5 rounded bg-green-600/30 text-green-300 text-xs font-mono">${match}</span>`
  })
}

// ─── Phone Number Utilities ────────────────────────────────────────────────

/**
 * Clean phone number to E.164 format (digits only)
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

/**
 * Validate if string looks like a valid phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = cleanPhoneNumber(phone)
  return cleaned.length >= 7 && cleaned.length <= 15
}

// ─── Text Processing ──────────────────────────────────────────────────────────

/**
 * Truncate text to a max length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Format text for display (trim whitespace)
 */
export function normalizeText(text: string | undefined | null): string {
  return (text || '').trim()
}

// ─── Array/Object Utilities ────────────────────────────────────────────────

/**
 * Group array items by a key function
 */
export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const key = keyFn(item)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

/**
 * Check if two objects are deeply equal
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== typeof b) return false
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    return keysA.every(key => deepEqual(a[key], b[key]))
  }
  
  return false
}
