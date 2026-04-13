import { createContext, useContext, useState, ReactNode } from 'react'

type SettingsSection = 'profile' | 'whatsapp-config' | 'email-config' | 'webhooks' | 'roles' | 'agents' | 'templates' | 'business'

interface SettingsContextType {
  activeSection: SettingsSection
  setActiveSection: (section: SettingsSection) => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile')

  return (
    <SettingsContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export type { SettingsSection }