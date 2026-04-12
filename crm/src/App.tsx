import { useState } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuthStore } from './features/auth/store'
import { TABS } from './utils/constants'
import type { TabKey } from './types'
import { LoginPage } from './features/auth'
import { Dashboard } from './pages/dashboard'
import { ContactsPage } from './features/contacts'
import { DealsPage } from './features/deals'
import { TasksPage } from './features/tasks'
import { AppointmentsPage } from './features/appointments'
import { WhatsAppPage } from './features/whatsapp'
import { Settings } from './pages/Settings'
import { MainLayout } from './features/layout'

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabKey>(TABS.DASHBOARD)

  const ALLOWED_TABS: TabKey[] = [TABS.DASHBOARD, TABS.CONTACTS, TABS.DEALS, TABS.TASKS, TABS.APPOINTMENTS, TABS.WHATSAPP, TABS.SETTINGS]

  const handleTabChange = (tab: TabKey) => {
    const validTab = ALLOWED_TABS.includes(tab) ? tab : TABS.DASHBOARD
    setActiveTab(validTab)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  const renderContent = () => {
    switch (activeTab) {
      case TABS.DASHBOARD:
        return <Dashboard />
      case TABS.CONTACTS:
        return <ContactsPage />
      case TABS.DEALS:
        return <DealsPage />
      case TABS.TASKS:
        return <TasksPage />
      case TABS.APPOINTMENTS:
        return <AppointmentsPage />
      case TABS.WHATSAPP:
        return <WhatsAppPage />
      case TABS.SETTINGS:
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <MainLayout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      userRole={user!.role}
      userName={user!.name}
      allowedTabs={ALLOWED_TABS}
      onLogout={() => useAuthStore.getState().logout()}
      connectionStatus="connected"
    >
      {renderContent()}
    </MainLayout>
  )
}

function App() {
  return (
    <TooltipProvider>
      <AppContent />
    </TooltipProvider>
  )
}

export default App
