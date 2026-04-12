import { apiClient } from '../../client'

export interface Contact {
  id: string
  workspaceId: string
  name: string
  email: string
  phone: string
  jobTitle?: string
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'
  assignedTo?: string
  companyId?: string
  tags?: string[]
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export const contactsApi = {
  getAll: async () => {
    const { data } = await apiClient.get<Contact[]>('/contacts')
    return data
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Contact>(`/contacts/${id}`)
    return data
  },

  create: async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data } = await apiClient.post<Contact>('/contacts', contact)
    return data
  },

  update: async (id: string, contact: Partial<Contact>) => {
    const { data } = await apiClient.patch<Contact>(`/contacts/${id}`, contact)
    return data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/contacts/${id}`)
  },
}
