import { ChevronLeft, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from './useSidebar'
import { SidebarProps, NavItem } from './types'
import { cn } from '@/lib/utils'
import { SidebarNav } from './SidebarNav'
import { SidebarFooter } from './SidebarFooter'
import { getSubNavComponent } from './subNavRegistry'
import { TABS } from '@/utils/constants'

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
  settingsActiveSection: string
  onItemClick: (item: NavItem) => void
  onBack: () => void
  onConversationClick: ReturnType<typeof useSidebar>['handleConversationClick']
  onSearchChange: (query: string) => void
  onExpandAndFocus?: () => void
  onSettingsSectionChange: (section: string) => void
  hasPermission: (permission: string) => boolean
}

function SidebarContent({
  activeSubmenu,
  collapsed,
  items,
  filteredConversations,
  activeConversationId,
  searchQuery,
  onItemClick,
  onBack,
  onConversationClick,
  onSearchChange,
  onExpandAndFocus,
  settingsActiveSection,
  onSettingsSectionChange,
  hasPermission,
}: SidebarContentProps) {
  if (activeSubmenu) {
    const SubNavComponent = getSubNavComponent(activeSubmenu)
    
    if (SubNavComponent) {
      const isSettings = activeSubmenu === TABS.SETTINGS
      
      const data = isSettings
        ? {
            activeSection: settingsActiveSection,
            onSectionChange: onSettingsSectionChange,
            hasPermission,
          }
        : {
            conversations: filteredConversations,
            activeConversationId,
            onConversationClick,
            searchQuery,
            onSearchChange,
            onExpandAndFocus,
          }

      return (
        <SubNavComponent
          collapsed={collapsed}
          onBack={onBack}
          data={data}
        />
      )
    }
  }

  return (
    <SidebarNav
      items={items}
      activeTab={activeSubmenu ?? ''}
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
    settingsActiveSection,
    toggleCollapse,
    closeSubmenu,
    setSearchQuery,
    handleConversationClick,
    handleNavItemClick,
    handleSettingsSectionChange,
    hasPermission,
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
        'transition-all duration-300 flex flex-col h-full shrink-0 overflow-hidden',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <SidebarHeader 
        collapsed={collapsed} 
        onToggle={toggleCollapse}
      />
      
      <SidebarContent
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
        settingsActiveSection={settingsActiveSection}
        onSettingsSectionChange={handleSettingsSectionChange}
        hasPermission={hasPermission}
      />

      <SidebarFooter collapsed={collapsed} />
    </aside>
  )
}
