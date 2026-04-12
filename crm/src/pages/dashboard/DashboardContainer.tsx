import {
  dashboardMetrics,
  salesFiguresData,
  averageTotalSalesData,
  salesReportData,
  visitorsData,
  pendingActions,
  kpiData,
} from '@/mock/dashboardData'
import { Users, Calendar, CheckSquare, MessageSquare, Briefcase } from 'lucide-react'
import {
  MetricCard,
  KPICard,
  SalesFiguresChart,
  VisitorsCard,
  AverageTotalSalesChart,
  SalesReportChart,
  PendingActionsList,
  ResponseMetricsCard,
} from './components'

export function DashboardContainer() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Panel de control principal</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          icon={<Users className="w-5 h-5" />}
          label="Contactos activos"
          value={kpiData.contactsActive}
          color="blue"
        />
        <KPICard
          icon={<MessageSquare className="w-5 h-5" />}
          label="Mensajes hoy"
          value={kpiData.messagesToday}
          color="green"
        />
        <KPICard
          icon={<Briefcase className="w-5 h-5" />}
          label="Deals abiertos"
          value={kpiData.dealsOpen}
          color="purple"
        />
        <KPICard
          icon={<CheckSquare className="w-5 h-5" />}
          label="Tareas pendientes"
          value={kpiData.tasksPending}
          color="orange"
        />
        <KPICard
          icon={<Users className="w-5 h-5" />}
          label="Leads nuevos"
          value={kpiData.newLeads}
          color="pink"
        />
        <KPICard
          icon={<Calendar className="w-5 h-5" />}
          label="Tiempo respuesta"
          value={kpiData.responseTime}
          color="teal"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <SalesFiguresChart data={salesFiguresData} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <AverageTotalSalesChart data={averageTotalSalesData} />
          <ResponseMetricsCard />
        </div>
      </div>

      <PendingActionsList actions={pendingActions} />
    </div>
  )
}
