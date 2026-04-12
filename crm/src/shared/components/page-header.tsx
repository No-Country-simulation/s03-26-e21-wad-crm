import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

/**
 * Reusable page header component
 * Displays title, optional subtitle, and optional action buttons
 * Used consistently across all pages (Contacts, Deals, Tasks, Appointments)
 *
 * @param title - Main page title
 * @param subtitle - Optional subtitle/description
 * @param actions - Optional action buttons or content
 */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
