import { apiClient } from '../../client'

export interface Task {
  id: string
  workspaceId: string
  title: string
  description?: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  dueAt?: string
  completed: boolean
  completedAt?: string
  completedBy?: string
  contactId?: string
  dealId?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export const tasksApi = {
  getAll: async () => {
    const { data } = await apiClient.get<Task[]>('/tasks')
    return data
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Task>(`/tasks/${id}`)
    return data
  },

  create: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data } = await apiClient.post<Task>('/tasks', task)
    return data
  },

  update: async (id: string, task: Partial<Task>) => {
    const { data } = await apiClient.patch<Task>(`/tasks/${id}`, task)
    return data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/tasks/${id}`)
  },

  toggleComplete: async (id: string) => {
    const task = await tasksApi.getById(id)
    return tasksApi.update(id, {
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined,
    })
  },
}
