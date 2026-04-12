import React from 'react'
import { STATUS_COLORS } from '@/shared/constants/colorMaps'

type StatusType = keyof typeof STATUS_COLORS

interface StatusBadgeProps {
  status: StatusType
  children?: React.ReactNode
}

/**
 * Reusable status badge component
 * Applies color schema based on status type (NEW, CONTACTED, QUALIFIED, CONVERTED, LOST)
 *
 * @param status - Status key from STATUS_COLORS
 * @param children - Display text (defaults to status if not provided)
 */
export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {children || status}
    </span>
  )
}
