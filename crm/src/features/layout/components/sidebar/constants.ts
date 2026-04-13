import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Calendar,
  MessageSquare,
  Settings,
  BarChart3,
  Mail,
} from 'lucide-react'

import { NavItem } from './types'

import { TABS } from '@/utils/constants'

export const NAV_ITEMS: NavItem[] = [
  {
    id: TABS.DASHBOARD,
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Panel de control',
  },
  {
    id: TABS.CONTACTS,
    label: 'Contactos',
    icon: Users,
    description: 'Gestionar contactos',
    hasSubmenu: true,
  },
  {
    id: TABS.DEALS,
    label: 'Deals',
    icon: Briefcase,
    description: 'Gestionar ventas',
    hasSubmenu: true,
  },
  {
    id: TABS.TASKS,
    label: 'Tareas',
    icon: CheckSquare,
    description: 'Gestionar tareas',
    hasSubmenu: true,
  },
  {
    id: TABS.APPOINTMENTS,
    label: 'Citas',
    icon: Calendar,
    description: 'Agendar citas',
    hasSubmenu: true,
  },
  {
    id: TABS.WHATSAPP,
    label: 'WhatsApp',
    icon: MessageSquare,
    description: 'Gestionar WhatsApp',
    hasSubmenu: true,
  },
  {
    id: TABS.EMAIL,
    label: 'Email',
    icon: Mail,
    description: 'Gestionar emails',
    hasSubmenu: true,
  },
  {
    id: TABS.METRICS,
    label: 'Métricas',
    icon: BarChart3,
    description: 'Reportes y análisis',
  },
  {
    id: TABS.SETTINGS,
    label: 'Configuración',
    icon: Settings,
    description: 'Ajustes del sistema',
    hasSubmenu: true,
  },
]