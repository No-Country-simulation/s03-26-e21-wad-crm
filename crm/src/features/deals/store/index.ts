import { create } from 'zustand'
import { dealsApi, type Deal } from '@/api/endpoints/deals'

interface DealsState {
  deals: Deal[]
  isLoading: boolean
  error: string | null
  selectedDeal: Deal | null
  
  fetchDeals: () => Promise<void>
  getDealById: (id: string) => Promise<void>
  createDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateDeal: (id: string, deal: Partial<Deal>) => Promise<void>
  deleteDeal: (id: string) => Promise<void>
  setSelectedDeal: (deal: Deal | null) => void
}

export const useDealsStore = create<DealsState>((set) => ({
  deals: [],
  isLoading: false,
  error: null,
  selectedDeal: null,

  fetchDeals: async () => {
    set({ isLoading: true, error: null })
    try {
      const deals = await dealsApi.getAll()
      set({ deals, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  getDealById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const deal = await dealsApi.getById(id)
      set({ selectedDeal: deal, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createDeal: async (deal) => {
    set({ isLoading: true, error: null })
    try {
      const newDeal = await dealsApi.create(deal)
      set((state) => ({
        deals: [...state.deals, newDeal],
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateDeal: async (id, deal) => {
    set({ isLoading: true, error: null })
    try {
      const updatedDeal = await dealsApi.update(id, deal)
      set((state) => ({
        deals: state.deals.map((d) => (d.id === id ? updatedDeal : d)),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteDeal: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await dealsApi.delete(id)
      set((state) => ({
        deals: state.deals.filter((d) => d.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  setSelectedDeal: (deal) => set({ selectedDeal: deal }),
}))
