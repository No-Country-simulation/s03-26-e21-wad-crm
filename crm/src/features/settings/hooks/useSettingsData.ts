import { useState, useCallback } from 'react'
import type { Role, Agent, TemplateCategory, UserProfile, BusinessSettings } from '../types'
import { MOCK_ROLES, MOCK_AGENTS, MOCK_TEMPLATES } from '../mocks'

export function useRoles() {
  const [roles] = useState<Role[]>(MOCK_ROLES)
  
  const createRole = useCallback(async (role: Omit<Role, 'users'>) => {
    console.log('Creating role:', role)
  }, [])
  
  const updateRole = useCallback(async (name: string, role: Partial<Role>) => {
    console.log('Updating role:', name, role)
  }, [])
  
  const deleteRole = useCallback(async (name: string) => {
    console.log('Deleting role:', name)
  }, [])
  
  return { roles, createRole, updateRole, deleteRole }
}

export function useAgents() {
  const [agents] = useState<Agent[]>(MOCK_AGENTS)
  
  const inviteAgent = useCallback(async (email: string, role: Agent['role']) => {
    console.log('Inviting agent:', email, role)
  }, [])
  
  const updateAgentRole = useCallback(async (email: string, role: Agent['role']) => {
    console.log('Updating agent role:', email, role)
  }, [])
  
  const removeAgent = useCallback(async (email: string) => {
    console.log('Removing agent:', email)
  }, [])
  
  return { agents, inviteAgent, updateAgentRole, removeAgent }
}

export function useTemplates() {
  const [templates] = useState<TemplateCategory[]>(MOCK_TEMPLATES)
  
  return { templates }
}

export function useProfile() {
  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    console.log('Updating profile:', profile)
  }, [])
  
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    console.log('Changing password')
  }, [])
  
  return { updateProfile, changePassword }
}

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings>({
    name: 'Nexo CRM',
    primaryColor: '#2563EB',
    timezone: 'America/Argentina/Buenos_Aires',
    currency: 'ARS',
  })
  
  const updateSettings = useCallback(async (newSettings: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
    console.log('Updating business settings:', newSettings)
  }, [])
  
  return { settings, updateSettings }
}