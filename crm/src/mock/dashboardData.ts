export const dashboardMetrics = {
  sales: {
    value: 27632,
    change: 2.5,
    trend: 'up',
    comparison: 'Compared to ($21,340 last year)',
  },
  purchase: {
    value: 20199,
    change: 0.5,
    trend: 'up',
    comparison: 'Compared to ($19,000 last year)',
  },
  return: {
    value: 110,
    change: -1.5,
    trend: 'down',
    comparison: 'Compared to ($165 last year)',
  },
  marketing: {
    value: 12632,
    change: 2.5,
    trend: 'up',
    comparison: 'Compared to ($10,500 last year)',
  },
}

export const salesFiguresData = [
  { month: 'Ene', marketingSales: 420, casesSales: 340 },
  { month: 'Feb', marketingSales: 380, casesSales: 290 },
  { month: 'Mar', marketingSales: 510, casesSales: 420 },
  { month: 'Abr', marketingSales: 480, casesSales: 390 },
  { month: 'May', marketingSales: 550, casesSales: 460 },
  { month: 'Jun', marketingSales: 620, casesSales: 510 },
  { month: 'Jul', marketingSales: 590, casesSales: 480 },
  { month: 'Ago', marketingSales: 640, casesSales: 520 },
  { month: 'Sep', marketingSales: 680, casesSales: 560 },
  { month: 'Oct', marketingSales: 720, casesSales: 590 },
  { month: 'Nov', marketingSales: 760, casesSales: 630 },
  { month: 'Dic', marketingSales: 800, casesSales: 670 },
]

export const averageTotalSalesData = [
  { name: 'Activos', value: 1247, percentage: 62 },
  { name: 'Leads', value: 485, percentage: 24 },
  { name: 'Inactivos', value: 268, percentage: 14 },
]

export const salesReportData = [
  { month: 'Jan', onlineSales: 400, offlineSales: 240 },
  { month: 'Feb', onlineSales: 300, offlineSales: 139 },
  { month: 'Mar', onlineSales: 750, offlineSales: 525 },
  { month: 'Apr', onlineSales: 278, offlineSales: 390 },
  { month: 'May', onlineSales: 189, offlineSales: 480 },
  { month: 'Jun', onlineSales: 239, offlineSales: 380 },
]

export const visitorsData = {
  count: 10254,
  change: -1.5,
  label: 'Visitors this year',
}

export interface ActionItem {
  id: string
  type: 'appointment' | 'task' | 'conversation' | 'deal'
  title: string
  subtitle: string
  time: string
  priority: 'high' | 'medium' | 'low'
}

export const pendingActions: ActionItem[] = [
  {
    id: '1',
    type: 'appointment',
    title: 'Juan Pérez',
    subtitle: 'Consulta gratuita',
    time: '10:00',
    priority: 'high',
  },
  {
    id: '2',
    type: 'appointment',
    title: 'María García',
    subtitle: 'Sesión coaching',
    time: '15:00',
    priority: 'medium',
  },
  {
    id: '3',
    type: 'task',
    title: 'Llamar a Roberto',
    subtitle: 'Seguimiento',
    time: '10:30',
    priority: 'high',
  },
  {
    id: '4',
    type: 'task',
    title: 'Enviar cotización a TechCorp',
    subtitle: 'Pending',
    time: '11:00',
    priority: 'medium',
  },
  {
    id: '5',
    type: 'task',
    title: 'Revisar presupuesto PC Gamer',
    subtitle: 'Pending',
    time: '14:00',
    priority: 'low',
  },
  {
    id: '6',
    type: 'conversation',
    title: 'Cliente nuevo',
    subtitle: '2 mensajes sin leer',
    time: '5m ago',
    priority: 'high',
  },
  {
    id: '7',
    type: 'conversation',
    title: 'Maria',
    subtitle: 'Sin responder',
    time: '1h ago',
    priority: 'medium',
  },
  {
    id: '8',
    type: 'deal',
    title: 'TechCorp',
    subtitle: '$2,500 - listo para cerrar',
    time: 'Esta semana',
    priority: 'high',
  },
  {
    id: '9',
    type: 'deal',
    title: 'StartupXYZ',
    subtitle: '$800 - necesita follow-up',
    time: 'Esta semana',
    priority: 'medium',
  },
]

export const kpiData = {
  contactsActive: 127,
  messagesToday: 45,
  dealsOpen: 23,
  tasksPending: 12,
  newLeads: 8,
  responseTime: '5min',
}
