import type { TabKey } from '@/types'
import type { SubNavComponent } from './types'
import { WhatsAppSubNav } from './sidebar-whatsapp'
import { ContactsSubNav } from './sidebar-contacts'
import { DealsSubNav } from './sidebar-deals'
import { TasksSubNav } from './sidebar-tasks'
import { AppointmentsSubNav } from './sidebar-appointments'
import { EmailSubNav } from './sidebar-email'
import { SettingsSubNav } from './sidebar-settings'
import { TABS } from '@/utils/constants'

type SubNavRegistry = Partial<Record<TabKey, SubNavComponent>>

export const subNavRegistry: SubNavRegistry = {
  [TABS.CONTACTS]: ContactsSubNav,
  [TABS.DEALS]: DealsSubNav,
  [TABS.TASKS]: TasksSubNav,
  [TABS.APPOINTMENTS]: AppointmentsSubNav,
  [TABS.WHATSAPP]: WhatsAppSubNav,
  [TABS.EMAIL]: EmailSubNav,
  [TABS.SETTINGS]: SettingsSubNav,
}

export function getSubNavComponent(tabKey: TabKey): SubNavComponent | undefined {
  return subNavRegistry[tabKey]
}

export function hasSubNav(tabKey: TabKey): boolean {
  return tabKey in subNavRegistry
}