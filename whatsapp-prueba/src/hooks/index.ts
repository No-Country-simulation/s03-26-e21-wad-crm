/**
 * Barrel export for all hooks
 * Centralizes imports for cleaner component code
 */

// Polling hook
export { usePolling } from './usePolling'
export type { UsePollingOptions } from './usePolling'

// WhatsApp API hook
export { useWhatsAppApi } from './useWhatsAppApi'
export type {
  UseWhatsAppApiOptions,
  UseWhatsAppApiState,
} from './useWhatsAppApi'

// Local storage hooks
export {
  useLocalStorage,
  useLocalStorageMulti,
  getLocalStorageSync,
  setLocalStorageSync,
  clearAllLocalStorage,
} from './useLocalStorage'
export type { UseLocalStorageOptions } from './useLocalStorage'

// RBAC hook
export { useRbac } from './useRbac'
