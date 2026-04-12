import { ChevronLeft, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from './useSidebar'
import { SidebarProps, NavItem } from './types'
import { cn } from '@/lib/utils'
import { SidebarNav } from './SidebarNav'
import { WhatsAppSubNav } from './WhatsAppSubNav'

interface SidebarHeaderProps {
  collapsed: boolean
  onToggle: () => void
}

function SidebarHeader({ collapsed, onToggle }: SidebarHeaderProps) {
  return (
    <div className="p-4 border-b border-border flex items-center justify-between">
      {!collapsed && (
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 size-8 rounded-lg bg-green-600/20 border border-green-600/50 flex items-center justify-center">
            <Zap className="size-5 text-green-400" />
          </div>
          <span className="text-sm font-bold truncate">
            Nexo CRM
          </span>
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        title={collapsed ? 'Expandir' : 'Contraer'}
        className="h-8 w-8 text-muted-foreground hover:text-green-600 hover:border hover:border-green-600/50"
      >
        <ChevronLeft className={cn('size-4 transition-transform', collapsed && 'rotate-180')} />
      </Button>
    </div>
  )
}

interface SidebarContentProps {
  activeTab: string
  activeSubmenu: string | null
  collapsed: boolean
  items: NavItem[]
  filteredConversations: ReturnType<typeof useSidebar>['filteredConversations']
  activeConversationId?: string
  searchQuery: string
  isMobile: boolean
  onItemClick: (item: NavItem) => void
  onBack: () => void
  onConversationClick: ReturnType<typeof useSidebar>['handleConversationClick']
  onSearchChange: (query: string) => void
  onExpandAndFocus?: () => void
}

function SidebarContent({
  activeTab,
  activeSubmenu,
  collapsed,
  items,
  filteredConversations,
  activeConversationId,
  searchQuery,
  isMobile,
  onItemClick,
  onBack,
  onConversationClick,
  onSearchChange,
  onExpandAndFocus,
}: SidebarContentProps) {
  if (activeSubmenu) {
    return (
      <WhatsAppSubNav
        conversations={filteredConversations}
        onBack={onBack}
        onConversationClick={onConversationClick}
        activeConversationId={activeConversationId}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        isMobile={isMobile}
        collapsed={collapsed}
        onExpandAndFocus={onExpandAndFocus}
      />
    )
  }

  return (
    <SidebarNav
      items={items}
      activeTab={activeTab}
      collapsed={collapsed}
      onItemClick={onItemClick}
    />
  )
}

export function Sidebar({
  activeTab,
  allowedTabs,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  onConversationSelect,
  activeConversationId: externalActiveConversationId,
}: SidebarProps) {
  const {
    collapsed,
    activeSubmenu,
    filteredItems,
    filteredConversations,
    searchQuery,
    activeConversationId,
    isMobile,
    toggleCollapse,
    closeSubmenu,
    setSearchQuery,
    handleConversationClick,
    handleNavItemClick,
  } = useSidebar({
    activeTab,
    allowedTabs,
    onTabChange,
    isCollapsed,
    onToggleCollapse,
    onConversationSelect,
    activeConversationId: externalActiveConversationId,
  })

  return (
    <aside
      className={cn(
        'border-r border-border bg-sidebar text-sidebar-foreground',
        'transition-all duration-300 flex flex-col h-full shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <SidebarHeader 
        collapsed={collapsed} 
        onToggle={toggleCollapse}
      />
      
      <SidebarContent
        activeTab={activeTab}
        activeSubmenu={activeSubmenu}
        collapsed={collapsed}
        items={filteredItems}
        filteredConversations={filteredConversations}
        activeConversationId={activeConversationId}
        searchQuery={searchQuery}
        isMobile={isMobile}
        onItemClick={handleNavItemClick}
        onBack={closeSubmenu}
        onConversationClick={handleConversationClick}
        onSearchChange={setSearchQuery}
        onExpandAndFocus={toggleCollapse}
      />
    </aside>
  )
}
