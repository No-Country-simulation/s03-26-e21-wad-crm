/**
 * WhatsApp Store - Zustand State Management
 * Manages all application state: config, templates, messages, conversations, user session
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  WhatsAppConfig,
  CrmConfig,
  Template,
  Conversation,
  Contact,
  LogEntry,
  RoleType,
  UserSession,
  TabKey,
  TABS,
} from '@/types';

// Store interface
export interface WhatsAppStore {
  // User & Session
  session: UserSession | null;
  setSession: (session: UserSession | null) => void;
  currentRole: RoleType | null;

  // Configuration
  config: WhatsAppConfig | null;
  setConfig: (config: WhatsAppConfig) => void;
  clearConfig: () => void;

  crmConfig: CrmConfig | null;
  setCrmConfig: (config: CrmConfig) => void;

  // Templates
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, template: Template) => void;
  deleteTemplate: (id: string) => void;

  // Conversations & Contacts
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  updateConversationLock: (conversationId: string, isLocked: boolean, lockedBy?: string) => void;
  selectedContactId: string | null;
  setSelectedContactId: (contactId: string | null) => void;
  showContactPanel: boolean;
  setShowContactPanel: (show: boolean) => void;

  // Logs
  logs: LogEntry[];
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;

  // UI State
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

// Store creation
export const useWhatsAppStore = create<WhatsAppStore>()(
  persist(
    (set, get) => ({
      // User & Session
      session: null,
      setSession: (session) => set({ session, currentRole: session?.role || null }),
      currentRole: null,

      // Configuration
      config: null,
      setConfig: (config) => set({ config }),
      clearConfig: () => set({ config: null }),

      crmConfig: null,
      setCrmConfig: (crmConfig) => set({ crmConfig }),

      // Templates
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

      // Conversations & Contacts
      conversations: [],
      setConversations: (conversations) => set({ conversations }),
      updateConversationLock: (conversationId, isLocked, lockedBy) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  isLocked,
                  lockedBy: isLocked ? lockedBy : undefined,
                  lockedAt: isLocked ? new Date().toISOString() : undefined,
                }
              : c
          ),
        })),
      selectedContactId: null,
      setSelectedContactId: (contactId) => set({ selectedContactId: contactId }),
      showContactPanel: false,
      setShowContactPanel: (show) => set({ showContactPanel: show }),

      // Logs
      logs: [],
      addLog: (log) =>
        set((state) => ({
          logs: [log, ...state.logs].slice(0, 100), // Keep last 100 logs
        })),
      clearLogs: () => set({ logs: [] }),

      // UI State
      activeTab: TABS.SEND as TabKey,
      setActiveTab: (tab) => set({ activeTab: tab }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'wa-prueba-store', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        config: state.config,
        crmConfig: state.crmConfig,
        templates: state.templates,
        session: state.session,
        currentRole: state.currentRole,
        activeTab: state.activeTab,
      }),
    }
  )
);
