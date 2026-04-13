import { useState, useMemo, useEffect } from 'react'
import { SidebarProps, NavItem, Conversation } from './types'
import { NAV_ITEMS } from './constants'
import { MOCK_WHATSAPP_CONVERSATIONS } from './sidebar-whatsapp'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface UseSidebarReturn {
  collapsed: boolean
  activeSubmenu: string | null
  filteredItems: NavItem[]
  filteredConversations: Conversation[]
  searchQuery: string
  activeConversationId: string | undefined
  isMobile: boolean
  toggleCollapse: () => void
  openSubmenu: (item: NavItem) => void
  closeSubmenu: () => void
  setSearchQuery: (query: string) => void
  handleConversationClick: (conversation: Conversation) => void
  handleNavItemClick: (item: NavItem) => void
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

  const activeConversationId = externalActiveConversationId ?? internalActiveConversationId
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    if (activeSubmenu && !activeTab.startsWith(activeSubmenu)) {
      setActiveSubmenu(null)
      setSearchQuery('')
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

  return {
    collapsed,
    activeSubmenu,
    filteredItems,
    filteredConversations,
    searchQuery,
    activeConversationId,
    isMobile,
    toggleCollapse,
    openSubmenu,
    closeSubmenu,
    setSearchQuery,
    handleConversationClick,
    handleNavItemClick,
  }
}
