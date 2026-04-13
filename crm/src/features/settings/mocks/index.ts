import type { Role, Agent, TemplateCategory } from '../types'

export const MOCK_ROLES: Role[] = [
  { name: 'ADMIN', users: 1, permissions: ['Todos'] },
  { name: 'MANAGER', users: 2, permissions: ['contacts:read/write', 'deals:read/write', 'tasks:read/write', 'analytics:read'] },
  { name: 'AGENT', users: 5, permissions: ['contacts:read', 'conversations:read/write', 'tasks:read/write'] },
  { name: 'VIEWER', users: 3, permissions: ['Solo lectura'] },
]

export const MOCK_AGENTS: Agent[] = [
  { name: 'Admin Nexo', email: 'admin@nexo.com', role: 'ADMIN', status: 'active' },
  { name: 'Juan Pérez', email: 'juan@nexo.com', role: 'AGENT', status: 'active' },
  { name: 'María García', email: 'maria@nexo.com', role: 'AGENT', status: 'active' },
]

export const MOCK_TEMPLATES: TemplateCategory[] = [
  { type: 'whatsapp', count: 5 },
  { type: 'email', count: 3 },
]

export const MOCK_TIMEZONES = [
  'America/Argentina/Buenos_Aires',
  'America/New_York',
  'Europe/Madrid',
]

export const MOCK_CURRENCIES = [
  { code: 'ARS', name: 'Peso Argentino' },
  { code: 'USD', name: 'Dólar' },
]