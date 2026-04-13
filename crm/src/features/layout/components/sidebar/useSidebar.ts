import { useState, useMemo, useEffect, useCallback } from 'react'
import { SidebarProps, NavItem, Conversation } from './types'
import { NAV_ITEMS } from './constants'
import { MOCK_WHATSAPP_CONVERSATIONS } from './sidebar-whatsapp'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useSettings } from '@/contexts/SettingsContext'
import { TABS } from '@/utils/constants'

interface UseSidebarReturn {
  collapsed: boolean
  activeSubmenu: string | null
  filteredItems: NavItem[]
  filteredConversations: Conversation[]
  searchQuery: string
  activeConversationId: string | undefined
  isMobile: boolean
  settingsActiveSection: string
  toggleCollapse: () => void
  openSubmenu: (item: NavItem) => void
  closeSubmenu: () => void
  setSearchQuery: (query: string) => void
  handleConversationClick: (conversation: Conversation) => void
  handleNavItemClick: (item: NavItem) => void
  handleSettingsSectionChange: (section: string) => void
  hasPermission: (permission: string) => boolean
}

export function useSidebar({
  activeTab,
  allowedTabs,
  isCollapsed = false,
  onToggleCollapse,
  onTabChange,
  onConversationSelect,
  activeConversationId: externalActiveConversationId,
}: SidebarProps): UseSidebarReturn {
  const [collapsed, setCollapsed] = useState(isCollapsed)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [internalActiveConversationId, setInternalActiveConversationId] = useState<string | undefined>(externalActiveConversationId)
  const [localSettingsSection, setLocalSettingsSection] = useState('profile')

  const settingsContext = useSettings()
  const activeConversationId = externalActiveConversationId ?? internalActiveConversationId
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  const settingsActiveSection = settingsContext?.activeSection ?? localSettingsSection

  useEffect(() => {
    if (activeSubmenu && !activeTab.startsWith(activeSubmenu)) {
      setActiveSubmenu(null)
      setSearchQuery('')
    }
  }, [activeTab, activeSubmenu])

  useEffect(() => {
    if (activeTab === TABS.SETTINGS && !activeSubmenu) {
      setActiveSubmenu(TABS.SETTINGS)
    }
  }, [activeTab, activeSubmenu])

  const filteredItems = useMemo(() => {
    return NAV_ITEMS.filter(item => allowedTabs.includes(item.id))
  }, [allowedTabs])

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return MOCK_WHATSAPP_CONVERSATIONS
    const query = searchQuery.toLowerCase()
    return MOCK_WHATSAPP_CONVERSATIONS.filter(
      conv =>
        conv.name.toLowerCase().includes(query) ||
        conv.lastMessage.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const toggleCollapse = () => {
    const newState = !collapsed
    setCollapsed(newState)
    onToggleCollapse?.(newState)
  }

  const openSubmenu = (item: NavItem) => {
    if (item.hasSubmenu) {
      setActiveSubmenu(item.id)
      setCollapsed(false)
      onTabChange(item.id)
    }
  }

  const closeSubmenu = () => {
    setActiveSubmenu(null)
    setSearchQuery('')
  }

  const handleConversationClick = (conversation: Conversation) => {
    setInternalActiveConversationId(conversation.id)
    onConversationSelect?.(conversation)
  }

  const handleNavItemClick = (item: NavItem) => {
    if (item.hasSubmenu) {
      openSubmenu(item)
    } else {
      onTabChange(item.id)
    }
  }

  const handleSettingsSectionChange = useCallback((section: string) => {
    if (settingsContext) {
      settingsContext.setActiveSection(section as any)
    } else {
      setLocalSettingsSection(section)
    }
  }, [settingsContext])

  const hasPermission = useCallback((_permission: string): boolean => {
    return true
  }, [])

  return {
    collapsed,
    activeSubmenu,
    filteredItems,
    filteredConversations,
    searchQuery,
    activeConversationId,
    isMobile,
    settingsActiveSection,
    toggleCollapse,
    openSubmenu,
    closeSubmenu,
    setSearchQuery,
    handleConversationClick,
    handleNavItemClick,
    handleSettingsSectionChange,
    hasPermission,
  }
}
