export type DealView = 'kanban' | 'table'

export interface DealStage {
  id: string
  name: string
  order: number
  probability: number
}

export interface Deal {
  id: string
  name: string
  value: number
  stage: DealStage
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export interface DealCardProps {
  deal: Deal
  formatCurrency: (value: number) => string
}

export interface DealStageColumnProps {
  stage: DealStage
  deals: Deal[]
  formatCurrency: (value: number) => string
}

export interface DealsTableProps {
  deals: Deal[]
  formatCurrency: (value: number) => string
}

export const DEAL_STAGES: DealStage[] = [
  { id: 'stage-1', name: 'Prospección', order: 1, probability: 10 },
  { id: 'stage-2', name: 'Calificación', order: 2, probability: 25 },
  { id: 'stage-3', name: 'Propuesta', order: 3, probability: 50 },
  { id: 'stage-4', name: 'Negociación', order: 4, probability: 75 },
  { id: 'stage-5', name: 'Ganado', order: 5, probability: 100 },
]
