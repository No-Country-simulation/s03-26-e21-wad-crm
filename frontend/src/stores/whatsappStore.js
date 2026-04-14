import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWhatsAppStore = create(
  persist(
    (set) => ({
      config: null,
      setConfig: (config) => set({ config }),
      clearConfig: () => set({ config: null }),

      crmConfig: null,
      setCrmConfig: (crmConfig) => set({ crmConfig }),

      templates: [],
      setTemplates: (templates) => set({ templates }),
      addTemplate: (template) =>
        set((state) => ({ templates: [...state.templates, template] })),
      updateTemplate: (id, template) =>
        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? template : t)),
        })),
      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),

      activeTab: 'conversations',
      setActiveTab: (tab) => set({ activeTab: tab }),

      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'nexo-whatsapp-store',
      partialize: (state) => ({
        config: state.config,
        crmConfig: state.crmConfig,
        templates: state.templates,
        activeTab: state.activeTab,
      }),
    }
  )
);
