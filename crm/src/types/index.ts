export enum ROLES {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  VIEWER = 'VIEWER',
}

export type RoleType = 'ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER' | 'USER'


// Import TabKey from constants instead of defining it here
import type { TabKey } from '../utils/constants'
export type { TabKey }


export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  role?: ROLES;
  avatar?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  status: 'active' | 'archived';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: ROLES;
  workspaceId?: string;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'trial';
  plan?: string;
  createdAt: string;
}