import { Card, CardContent } from '@/shared/ui/card'
import type { DealsTableProps } from '../types'

export function DealsTable({ deals, formatCurrency }: DealsTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etapa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Probabilidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {deals.map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{deal.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(deal.value)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{deal.stage.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{deal.stage.probability}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
