import { create } from 'zustand'

export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  workspaceId: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

const PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ['*'],
  MANAGER: ['contacts:read', 'contacts:write', 'deals:read', 'deals:write', 'tasks:read', 'tasks:write', 'conversations:read', 'conversations:write', 'analytics:read', 'settings:read', 'settings:write', 'appointments:read', 'appointments:write'],
  AGENT: ['contacts:read', 'conversations:read', 'conversations:write', 'tasks:read', 'tasks:write', 'appointments:read', 'appointments:write'],
  VIEWER: ['contacts:read', 'conversations:read', 'tasks:read', 'appointments:read']
}

const TEST_USERS: Record<string, User> = {
  'admin@nexo.com': { id: '1', email: 'admin@nexo.com', name: 'Admin Nexo', role: 'ADMIN', workspaceId: 'ws-1' },
  'manager@nexo.com': { id: '2', email: 'manager@nexo.com', name: 'Manager', role: 'MANAGER', workspaceId: 'ws-1' },
  'agent@nexo.com': { id: '3', email: 'agent@nexo.com', name: 'Agent', role: 'AGENT', workspaceId: 'ws-1' },
  'viewer@nexo.com': { id: '4', email: 'viewer@nexo.com', name: 'Viewer', role: 'VIEWER', workspaceId: 'ws-1' },
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, _password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const foundUser = TEST_USERS[email]
    if (foundUser) {
      set({ user: foundUser, isAuthenticated: true })
      localStorage.setItem('crm_user', JSON.stringify(foundUser))
    } else {
      throw new Error('Credenciales inválidas')
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false })
    localStorage.removeItem('crm_user')
  },

  hasPermission: (permission: string) => {
    const { user } = get()
    if (!user) return false
    const userPermissions = PERMISSIONS[user.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  },
}))

if (typeof window !== 'undefined') {
  const savedUser = localStorage.getItem('crm_user')
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser)
      useAuthStore.setState({ user, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('crm_user')
      useAuthStore.setState({ isLoading: false })
    }
  } else {
    useAuthStore.setState({ isLoading: false })
  }
}
