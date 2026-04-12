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
import { NavItem, Conversation } from './types'
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
  },
  {
    id: TABS.DEALS,
    label: 'Deals',
    icon: Briefcase,
    description: 'Gestionar ventas',
  },
  {
    id: TABS.TASKS,
    label: 'Tareas',
    icon: CheckSquare,
    description: 'Gestionar tareas',
  },
  {
    id: TABS.APPOINTMENTS,
    label: 'Citas',
    icon: Calendar,
    description: 'Agendar citas',
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
  },
]

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    lastMessage: 'Perfecto, quedo atento al presupuesto',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'María García',
    lastMessage: '¿Podemos agendar una llamada para mañana?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '3',
    name: 'TechCorp S.A.',
    lastMessage: 'Gracias por la información',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: '4',
    name: 'Carlos López',
    lastMessage: 'Voy a revisar el contrato y te aviso',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '5',
    name: 'Ana Martínez',
    lastMessage: '¿Tienen disponibilidad para esta semana?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '6',
    name: 'StartupXYZ',
    lastMessage: 'Confirmado para el viernes',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    unreadCount: 0,
    isOnline: false,
  },
]

export const WHATSAPP_OPTIONS = [
  { id: 'all', label: 'Todas las conversaciones' },
  { id: 'unread', label: 'No leídos' },
  { id: 'active', label: 'Activos' },
  { id: 'archived', label: 'Archivados' },
]
