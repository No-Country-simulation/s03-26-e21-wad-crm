import { create } from 'zustand'
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  setAccessToken,
  setRefreshToken,
  getAccessToken,
  clearTokens,
  type LoginRequest,
  type RegisterRequest,
  type TokenResponse,
} from '@/api/endpoints/auth'

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
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
  checkAuth: () => Promise<void>
}

const PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ['*'],
  MANAGER: [
    'contacts:read',
    'contacts:write',
    'deals:read',
    'deals:write',
    'tasks:read',
    'tasks:write',
    'conversations:read',
    'conversations:write',
    'analytics:read',
    'settings:read',
    'settings:write',
    'appointments:read',
    'appointments:write',
  ],
  AGENT: [
    'contacts:read',
    'conversations:read',
    'conversations:write',
    'tasks:read',
    'tasks:write',
    'appointments:read',
    'appointments:write',
  ],
  VIEWER: [
    'contacts:read',
    'conversations:read',
    'tasks:read',
    'appointments:read',
  ],
}

function mapRoleToUserRole(role: string): UserRole {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return 'ADMIN'
    case 'MANAGER':
      return 'MANAGER'
    case 'AGENT':
      return 'AGENT'
    default:
      return 'VIEWER'
  }
}

function mapTokenResponseToUser(
  response: TokenResponse,
  email: string,
  name: string = ''
): User {
  return {
    id: '', // Will be set from /me endpoint if needed
    email,
    name: name || email.split('@')[0],
    role: mapRoleToUserRole(response.role),
    workspaceId: response.workspaceId,
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    console.log('🔐 Login attempt:', { email, password }) // DEBUG
    try {
      const response = await apiLogin({ email, password } as LoginRequest)
      console.log('✅ Login response:', response) // DEBUG

      // Store tokens
      setAccessToken(response.accessToken)
      setRefreshToken(response.refreshToken)

      // Create user from token response
      const user = mapTokenResponseToUser(response, email)

      set({ user, isAuthenticated: true, isLoading: false })

      // Persist user to localStorage
      localStorage.setItem('crm_user', JSON.stringify(user))
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al iniciar sesión'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRegister(data)

      // Store tokens
      setAccessToken(response.accessToken)
      setRefreshToken(response.refreshToken)

      // Create user from token response
      const user = mapTokenResponseToUser(response, data.email, data.name)

      set({ user, isAuthenticated: true, isLoading: false })

      // Persist user to localStorage
      localStorage.setItem('crm_user', JSON.stringify(user))
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al registrar'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  logout: async () => {
    try {
      await apiLogout()
    } catch {
      // Ignore logout API errors
    }
    clearTokens()
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  hasPermission: (permission: string) => {
    const { user } = get()
    if (!user) return false
    const userPermissions = PERMISSIONS[user.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  },

  checkAuth: async () => {
    const token = getAccessToken()
    console.log('🔍 checkAuth: token exists?', !!token) // DEBUG
    if (!token) {
      set({ isLoading: false })
      return
    }

    // Restore user from localStorage if exists
    try {
      const savedUser = localStorage.getItem('crm_user')
      console.log('🔍 checkAuth: savedUser?', !!savedUser) // DEBUG
      if (savedUser) {
        const user = JSON.parse(savedUser)
        console.log('✅ checkAuth: restored user:', user) // DEBUG
        set({ user, isAuthenticated: true, isLoading: false })
      } else {
        // Token exists pero user no en localStorage - logout
        console.log('⚠️ checkAuth: token exists but no user, logging out') // DEBUG
        clearTokens()
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch (err) {
      console.error('❌ checkAuth error:', err) // DEBUG
      clearTokens()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))

// Initialize auth state from localStorage
if (typeof window !== 'undefined') {
  const savedUser = localStorage.getItem('crm_user')
  const token = getAccessToken()

  if (savedUser && token) {
    try {
      const user = JSON.parse(savedUser)
      useAuthStore.setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      clearTokens()
      useAuthStore.setState({ isLoading: false })
    }
  } else {
    useAuthStore.setState({ isLoading: false })
  }
}