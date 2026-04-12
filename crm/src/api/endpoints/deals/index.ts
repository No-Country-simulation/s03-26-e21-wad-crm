import { apiClient } from '../../client'

export interface Deal {
  id: string
  workspaceId: string
  name: string
  value: number
  contactId: string
  assignedTo?: string
  stage: {
    id: string
    name: string
    order: number
    probability: number
  }
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export const dealsApi = {
  getAll: async () => {
    const { data } = await apiClient.get<Deal[]>('/deals')
    return data
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Deal>(`/deals/${id}`)
    return data
  },

  create: async (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data } = await apiClient.post<Deal>('/deals', deal)
    return data
  },

  update: async (id: string, deal: Partial<Deal>) => {
    const { data } = await apiClient.patch<Deal>(`/deals/${id}`, deal)
    return data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/deals/${id}`)
  },
}
