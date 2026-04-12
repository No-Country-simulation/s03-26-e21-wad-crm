import { useState, useEffect, ReactNode } from 'react'
import { Header } from '../header'
import { Sidebar, MOCK_CONVERSATIONS } from '../sidebar'
import type { Conversation } from '../sidebar'
import { EventTicker, mockNotifications } from '../event-ticker'
import { WhatsAppConversationContainer, WhatsAppConversationHeader } from '@/features/whatsapp'
import { RoleType, TabKey } from '@/types'
import { TABS } from '@/utils/constants'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ContactDetailsPanel } from '../sidebar/ContactDetailsPanel'

const eventTickerMocks = mockNotifications.map(notif => ({
  ...notif,
  section: notif.section as TabKey
}))

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
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)

  useEffect(() => {
    if (activeTab === TABS.WHATSAPP && !activeConversation && MOCK_CONVERSATIONS.length > 0) {
      setActiveConversation(MOCK_CONVERSATIONS[0])
    }
  }, [activeTab, activeConversation])

  const handleProfileClick = () => {
    console.log('Navegando a Mi Perfil...')
  }

  const handleSettingsClick = () => {
    onTabChange(TABS.SETTINGS)
  }

  const handleConversationSelect = (conversation: Conversation) => {
    setActiveConversation(conversation)
  }

  const isWhatsAppActive = activeTab === TABS.WHATSAPP

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        activeTab={activeTab}
        allowedTabs={allowedTabs}
        onTabChange={onTabChange}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
        onConversationSelect={handleConversationSelect}
        activeConversationId={activeConversation?.id}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          userRole={userRole}
          userName={userName}
          onLogout={onLogout}
          connectionStatus={connectionStatus}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
        />

        <main className="flex-1 overflow-hidden">
          {isWhatsAppActive ? (
            <div className="h-full flex flex-col">
              {activeConversation && (
                <WhatsAppConversationHeader
                  conversation={{
                    id: activeConversation.id,
                    name: activeConversation.name,
                    phone: '+54 9 11 1234-5678',
                    isOnline: activeConversation.isOnline,
                    messages: [],
                  }}
                />
              )}
              <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  <ResizablePanel defaultSize={65} minSize={30}>
                    {activeConversation ? (
                      <WhatsAppConversationContainer
                        conversation={{
                          id: activeConversation.id,
                          name: activeConversation.name,
                          phone: '+54 9 11 1234-5678',
                          isOnline: activeConversation.isOnline,
                          messages: [],
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center p-4">
                          <p>No hay conversaciones disponibles</p>
                          <p className="text-sm mt-2">Selecciona una conversación del sidebar</p>
                        </div>
                      </div>
                    )}
                  </ResizablePanel>
                  <ResizableHandle withHandle className="w-1 bg-border hover:bg-green-600/50 transition-colors" />
                  <ResizablePanel defaultSize={35} minSize={20} style={{ minWidth: '350px' }}>
                    {activeConversation ? (
                      <ContactDetailsPanel conversation={activeConversation} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <p>Selecciona un contacto</p>
                      </div>
                    )}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="p-6">
                <div className="max-w-7xl mx-auto">{children}</div>
              </div>
            </div>
          )}
        </main>

        <EventTicker 
          data={eventTickerMocks} 
          interval={60000} 
          onNotificationClick={(section) => onTabChange(section)}
        />
      </div>
    </div>
  )
}
