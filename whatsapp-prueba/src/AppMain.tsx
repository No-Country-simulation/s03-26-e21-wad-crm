/**
 * AppMain - Main Application Container
 * 
 * Extracted and refactored version of AppOld.tsx
 * Manages tab navigation, state, and component layout
 * 
 * RBAC handled by parent App.tsx wrapper
 */

import { useState, useEffect } from 'react'
import { TABS } from '@/utils/constants'
import { useRbac } from '@/hooks/useRbac'

// Placeholder: These will be imported from components/panels/* when ready
// import { ConversationsPanel } from '@/components/panels/ConversationsPanel'
// import { SendPanel } from '@/components/panels/SendPanel'
// import { TemplatesPanel } from '@/components/panels/TemplatesPanel'
// import { ConfigPanel } from '@/components/panels/ConfigPanel'
// import { CrmPanel } from '@/components/panels/CrmPanel'
// import { LogsPanel } from '@/components/panels/LogsPanel'
// import { WebhookSimulator } from '@/components/panels/WebhookSimulator'
// import { UserDataPanel } from '@/components/panels/UserDataPanel'

interface AppMainProps {
  crmConfig?: any
  userRole?: string
}

export function AppMain({ crmConfig, userRole }: AppMainProps) {
  const [activeTab, setActiveTab] = useState(TABS.CONVERSATIONS)
  const { hasPermission, tabs: allowedTabs } = useRbac(userRole)

  // Auto-select first available tab on role change
  useEffect(() => {
    if (!allowedTabs.includes(activeTab) && allowedTabs.length > 0) {
      setActiveTab(allowedTabs[0])
    }
  }, [activeTab, allowedTabs])

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">WA</span>
            </div>
            <h1 className="text-xl font-bold text-white">WhatsApp CRM</h1>
          </div>
          <div className="text-sm text-slate-400">
            {userRole && <span>Role: <strong>{userRole}</strong></span>}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950 overflow-x-auto">
        <div className="flex gap-1 px-6 py-2 min-w-max">
          {allowedTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Placeholder content until components are extracted */}
          {activeTab === TABS.CONVERSATIONS && (
            <div className="text-center text-slate-400 py-8">
              <p>Conversations Panel - Coming Soon</p>
            </div>
          )}
          {activeTab === TABS.SEND && (
            <div className="text-center text-slate-400 py-8">
              <p>Send Message Panel - Coming Soon</p>
            </div>
          )}
          {activeTab === TABS.TEMPLATES && (
            <div className="text-center text-slate-400 py-8">
              <p>Templates Panel - Coming Soon</p>
            </div>
          )}
          {activeTab === TABS.CONFIG && (
            <div className="text-center text-slate-400 py-8">
              <p>Configuration Panel - Coming Soon</p>
            </div>
          )}
          {activeTab === TABS.CRM && (
            <div className="text-center text-slate-400 py-8">
              <p>CRM Panel - Coming Soon</p>
            </div>
          )}
          {activeTab === TABS.LOGS && (
            <div className="text-center text-slate-400 py-8">
              <p>Logs Panel - Coming Soon</p>
            </div>
          )}
          {activeTab === TABS.WEBHOOK && (
            <div className="text-center text-slate-400 py-8">
              <p>Webhook Simulator - Coming Soon</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
