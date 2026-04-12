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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Sales"
          value={dashboardMetrics.sales.value}
          change={dashboardMetrics.sales.change}
          trend={dashboardMetrics.sales.trend}
          comparison={dashboardMetrics.sales.comparison}
        />
        <MetricCard
          title="Purchase"
          value={dashboardMetrics.purchase.value}
          change={dashboardMetrics.purchase.change}
          trend={dashboardMetrics.purchase.trend}
          comparison={dashboardMetrics.purchase.comparison}
        />
        <MetricCard
          title="Return"
          value={dashboardMetrics.return.value}
          change={dashboardMetrics.return.change}
          trend={dashboardMetrics.return.trend}
          comparison={dashboardMetrics.return.comparison}
        />
        <MetricCard
          title="Marketing"
          value={dashboardMetrics.marketing.value}
          change={dashboardMetrics.marketing.change}
          trend={dashboardMetrics.marketing.trend}
          comparison={dashboardMetrics.marketing.comparison}
        />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesFiguresChart data={salesFiguresData} />
        <VisitorsCard data={visitorsData} chartData={salesFiguresData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AverageTotalSalesChart data={averageTotalSalesData} />
        <SalesReportChart data={salesReportData} />
      </div>

      <PendingActionsList actions={pendingActions} />
    </div>
  )
}
