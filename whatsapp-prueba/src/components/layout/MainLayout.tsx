/**
 * MainLayout - Complete application layout wrapper
 *
 * Combines:
 * - Header (top navigation)
 * - Sidebar (left navigation)
 * - Main content area
 * - Responsive design with collapsible sidebar
 */

import { useState, ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { RoleType, TabKey } from '@/types'

interface MainLayoutProps {
  children?: ReactNode
  userRole?: RoleType
  userName?: string
  activeTab: TabKey
  allowedTabs: TabKey[]
  onTabChange: (tab: TabKey) => void
  onLogout?: () => void
  connectionStatus?: 'connected' | 'connecting' | 'disconnected'
}

export function MainLayout({
  children,
  userRole,
  userName,
  activeTab,
  allowedTabs,
  onTabChange,
  onLogout,
  connectionStatus = 'connected',
}: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <Header
        userRole={userRole}
        userName={userName}
        onLogout={onLogout}
        connectionStatus={connectionStatus}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          allowedTabs={allowedTabs}
          onTabChange={onTabChange}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
