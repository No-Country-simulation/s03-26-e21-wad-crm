import { Separator } from '@/components/ui/separator'
import type { SidebarSubNavProps } from '../types'
import { SubNavBackButton, SubNavSearchInput } from '../shared'

export function ContactsSubNav({ 
  collapsed, 
  onBack, 
  data 
}: SidebarSubNavProps) {
  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 flex flex-col gap-1">
      <SubNavBackButton collapsed={collapsed} onBack={onBack} label="Contactos" />
      <Separator className="my-2" />
      <SubNavSearchInput
        collapsed={collapsed}
        value={data?.searchQuery ?? ''}
        onChange={data?.onSearchChange ?? (() => {})}
        placeholder="Buscar contactos..."
      />
      <Separator className="my-2" />
      <div className="flex flex-col gap-1 mt-2">
        {/* TODO: Add contacts list */}
      </div>
    </nav>
  )
}