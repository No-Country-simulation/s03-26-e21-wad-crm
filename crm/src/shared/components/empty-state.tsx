import React from 'react'

interface EmptyStateProps {
  message: string
  icon?: React.ReactNode
}

/**
 * Reusable empty state component
 * Displays centered message when no data is available
 * Used in: Contacts, Deals, Tasks when filtered results are empty
 *
 * @param message - Text to display
 * @param icon - Optional icon to display above message
 */
export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <p className="text-gray-500">{message}</p>
    </div>
  )
}
