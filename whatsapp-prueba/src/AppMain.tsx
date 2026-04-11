/**
 * AppMain - Main Application Container
 * 
 * Manages tab navigation, panel rendering, and RBAC filtering.
 * Extracted from AppOld.tsx for type safety and modularity.
 * 
 * RBAC is enforced:
 * - hasPermission() guard on each panel render
 * - allowedTabs calculated per userRole
 * - Auto-select first available tab on role change
 */

import { useState, useEffect } from 'react'
import { TABS } from '@/utils/constants'
import { useRbac } from '@/hooks/useRbac'
import { RoleType, CrmConfig } from '@/types'
import { ConversationsPanel } from '@/components/panels/ConversationsPanel'
import { SendPanel } from '@/components/panels/SendPanel'
import { TemplatesPanel } from '@/components/panels/TemplatesPanel'
import { ConfigPanel } from '@/components/panels/ConfigPanel'
import { CrmPanel } from '@/components/panels/CrmPanel'
import { LogsPanel } from '@/components/panels/LogsPanel'
import { WebhookSimulator } from '@/components/panels/WebhookSimulator'
import { ContactInfoPanel } from '@/components/panels/ContactInfoPanel'

interface AppMainProps {
  crmConfig?: CrmConfig
  userRole?: RoleType
}

export function AppMain({ crmConfig, userRole }: AppMainProps) {
  const [activeTab, setActiveTab] = useState(TABS.CONVERSATIONS)
  const { hasPermission, tabs: getAllowedTabs } = useRbac(userRole)
  const allowedTabs = getAllowedTabs()

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
          {activeTab === TABS.CONVERSATIONS && hasPermission(TABS.CONVERSATIONS) && <ConversationsPanel />}
          {activeTab === TABS.SEND && hasPermission(TABS.SEND) && <SendPanel />}
          {activeTab === TABS.TEMPLATES && hasPermission(TABS.TEMPLATES) && <TemplatesPanel />}
          {activeTab === TABS.CONFIG && hasPermission(TABS.CONFIG) && <ConfigPanel />}
          {activeTab === TABS.CRM && hasPermission(TABS.CRM) && <CrmPanel />}
          {activeTab === TABS.LOGS && hasPermission(TABS.LOGS) && <LogsPanel />}
          {activeTab === TABS.WEBHOOK && hasPermission(TABS.WEBHOOK) && <WebhookSimulator />}
          {activeTab === 'contact' && hasPermission('contact') && <ContactInfoPanel />}
        </div>
      </main>
    </div>
  )
}
