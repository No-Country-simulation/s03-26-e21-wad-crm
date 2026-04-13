import { Separator } from '@/components/ui/separator'
import type { SidebarSubNavProps } from '../types'
import { SubNavBackButton, SubNavSearchInput } from '../shared'

export function EmailSubNav({ 
  collapsed, 
  onBack, 
  data 
}: SidebarSubNavProps) {
  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 flex flex-col gap-1">
      <SubNavBackButton collapsed={collapsed} onBack={onBack} label="Email" />
      <Separator className="my-2" />
      <SubNavSearchInput
        collapsed={collapsed}
        value={data?.searchQuery ?? ''}
        onChange={data?.onSearchChange ?? (() => {})}
        placeholder="Buscar emails..."
      />
      <Separator className="my-2" />
      <div className="flex flex-col gap-1 mt-2">
        {/* TODO: Add emails list */}
      </div>
    </nav>
  )
}