/**
 * AppMain - Panel Renderer (Pure Component)
 * 
 * Single Responsibility: Render the correct panel based on activeTab.
 * NO layout, NO navigation, NO state management.
 * 
 * Clean Architecture:
 * - This is a PURE presenter component
 * - Receives activeTab from parent (App.tsx)
 * - Returns the corresponding panel component
 * - RBAC is enforced by parent before calling this
 */

import { TabKey, TABS } from '@/types'
import { useWhatsAppStore } from '@/store/whatsappStore'
import { ConversationsPanel } from '@/components/panels/ConversationsPanel'
import { SendPanel } from '@/components/panels/SendPanel'
import { TemplatesPanel } from '@/components/panels/TemplatesPanel'
import { ConfigPanel } from '@/components/panels/ConfigPanel'
import { CrmPanel } from '@/components/panels/CrmPanel'
import { LogsPanel } from '@/components/panels/LogsPanel'
import { WebhookSimulator } from '@/components/panels/WebhookSimulator'
import { ContactInfoPanel } from '@/components/panels/ContactInfoPanel'

interface AppMainProps {
  activeTab: TabKey
}

/**
 * Renders the active panel based on tab selection.
 * Parent (App.tsx) handles RBAC, routing, and state.
 */
export function AppMain({ activeTab }: AppMainProps) {
  const config = useWhatsAppStore((state) => state.config)
  const crmConfig = useWhatsAppStore((state) => state.crmConfig)
  const templates = useWhatsAppStore((state) => state.templates)

  switch (activeTab) {
    case TABS.CONVERSATIONS:
      return <ConversationsPanel config={config} crmConfig={crmConfig} />
    
    case TABS.SEND:
      return <SendPanel config={config} templates={templates} crmConfig={crmConfig} />
    
    case TABS.TEMPLATES:
      return <TemplatesPanel />
    
    case TABS.CONFIG:
      return <ConfigPanel config={config} crmConfig={crmConfig} />
    
    case TABS.CRM:
      return <CrmPanel />
    
    case TABS.LOGS:
      return <LogsPanel />
    
    case TABS.WEBHOOK:
      return <WebhookSimulator />
    
    case 'contact':
      return <ContactInfoPanel />
    
    default:
      return <ConversationsPanel config={config} crmConfig={crmConfig} />
  }
}
