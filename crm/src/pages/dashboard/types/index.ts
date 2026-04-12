export interface KPICardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal'
}

export interface MetricCardProps {
  title: string
  value: number
  change: number
  trend: 'up' | 'down'
  comparison: string
}

export interface PendingAction {
  id: string
  type: 'task' | 'appointment' | 'follow-up'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  dueDate: string
}

export interface ChartDataPoint {
  month: string
  marketingSales: number
  casesSales: number
}

export interface AverageSalesData {
  name: string
  value: number
  percentage: number
}

export interface SalesReportData {
  category: string
  value: number
}

export interface VisitorsData {
  count: number
  change: number
}

export interface KPIData {
  contactsActive: number
  messagesToday: number
  dealsOpen: number
  tasksPending: number
  newLeads: number
  responseTime: string
}

export interface DashboardMetrics {
  sales: MetricData
  purchase: MetricData
  return: MetricData
  marketing: MetricData
}

export interface MetricData {
  value: number
  change: number
  trend: 'up' | 'down'
  comparison: string
}
