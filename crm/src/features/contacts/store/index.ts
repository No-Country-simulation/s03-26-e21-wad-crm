import { create } from 'zustand'
import { contactsApi, type Contact } from '@/api/endpoints/contacts'

interface ContactsState {
  contacts: Contact[]
  isLoading: boolean
  error: string | null
  selectedContact: Contact | null
  
  fetchContacts: () => Promise<void>
  getContactById: (id: string) => Promise<void>
  createContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>
  deleteContact: (id: string) => Promise<void>
  setSelectedContact: (contact: Contact | null) => void
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  isLoading: false,
  error: null,
  selectedContact: null,

  fetchContacts: async () => {
    set({ isLoading: true, error: null })
    try {
      const contacts = await contactsApi.getAll()
      set({ contacts, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  getContactById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const contact = await contactsApi.getById(id)
      set({ selectedContact: contact, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createContact: async (contact) => {
    set({ isLoading: true, error: null })
    try {
      const newContact = await contactsApi.create(contact)
      set((state) => ({
        contacts: [...state.contacts, newContact],
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateContact: async (id, contact) => {
    set({ isLoading: true, error: null })
    try {
      const updatedContact = await contactsApi.update(id, contact)
      set((state) => ({
        contacts: state.contacts.map((c) => (c.id === id ? updatedContact : c)),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteContact: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await contactsApi.delete(id)
      set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  setSelectedContact: (contact) => set({ selectedContact: contact }),
}))
