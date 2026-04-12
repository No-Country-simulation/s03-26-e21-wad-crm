import { create } from 'zustand'
import { ROLES, type Contact, type Conversation, type Message } from '@/types'

interface WhatsAppState {
  conversations: Conversation[]
  messages: Record<string, Message[]>
  contacts: Contact[]
  currentRole: ROLES
  isConnected: boolean
  selectedConversationId: string | null
  
  setConversations: (conversations: Conversation[]) => void
  setMessages: (conversationId: string, messages: Message[]) => void
  addMessage: (conversationId: string, message: Message) => void
  setContacts: (contacts: Contact[]) => void
  setCurrentRole: (role: ROLES) => void
  setConnected: (connected: boolean) => void
  selectConversation: (id: string | null) => void
}

export const useWhatsAppStore = create<WhatsAppState>((set) => ({
  conversations: [],
  messages: {},
  contacts: [],
  currentRole: ROLES.ADMIN,
  isConnected: false,
  selectedConversationId: null,

  setConversations: (conversations) => set({ conversations }),
  
  setMessages: (conversationId, messages) => set((state) => ({
    messages: { ...state.messages, [conversationId]: messages }
  })),
  
  addMessage: (conversationId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [conversationId]: [...(state.messages[conversationId] || []), message]
    }
  })),
  
  setContacts: (contacts) => set({ contacts }),
  
  setCurrentRole: (role) => set({ currentRole: role }),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  selectConversation: (id) => set({ selectedConversationId: id }),
}))