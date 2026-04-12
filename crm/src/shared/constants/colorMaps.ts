/**
 * Centralized Color Maps - Single Source of Truth
 *
 * All color schemas for badges, statuses, and priorities are defined here.
 * This eliminates duplication across pages and makes theming changes simple.
 *
 * Usage:
 * import { STATUS_COLORS, PRIORITY_COLORS } from '@/shared/constants/colorMaps'
 * <span className={STATUS_COLORS[contact.status]}>{contact.status}</span>
 */

/**
 * Contact status color schema
 * Used in: ContactsPage, Deals (potential), Appointments
 */
export const STATUS_COLORS = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-purple-100 text-purple-800',
  CONVERTED: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
} as const

/**
 * Task priority color schema
 * Used in: TasksPage
 */
export const PRIORITY_COLORS = {
  HIGH: 'bg-red-100 text-red-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800',
} as const

/**
 * General tag/label color schema
 * Used in: Contacts (contact tags), Deals, Tasks (tags)
 */
export const TAG_COLORS = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-cyan-100 text-cyan-700',
} as const

/**
 * Deal stage probability colors
 * Used in: DealsPage (Kanban view)
 */
export const DEAL_STAGE_COLORS = {
  prospecting: 'bg-blue-100 text-blue-800',
  qualification: 'bg-cyan-100 text-cyan-800',
  proposal: 'bg-yellow-100 text-yellow-800',
  negotiation: 'bg-orange-100 text-orange-800',
  won: 'bg-green-100 text-green-800',
} as const

/**
 * Type exports for type-safe color keys
 */
export type StatusColor = keyof typeof STATUS_COLORS
export type PriorityColor = keyof typeof PRIORITY_COLORS
export type TagColor = keyof typeof TAG_COLORS
export type DealStageColor = keyof typeof DEAL_STAGE_COLORS
