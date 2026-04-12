import React from 'react'

interface LoadingSpinnerProps {
  show?: boolean
  children?: React.ReactNode
}

/**
 * Reusable loading spinner component
 * Shows centered spinner or renders children when not loading
 *
 * @param show - If false, renders children instead (default: true)
 * @param children - Content to render when not loading
 */
export function LoadingSpinner({ show = true, children }: LoadingSpinnerProps) {
  if (!show) {
    return <>{children}</> ?? null
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  )
}
