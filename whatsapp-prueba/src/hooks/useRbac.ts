/**
 * useRbac.ts
 * Hook for role-based access control checks
 * Provides utilities to check user permissions based on their role
 */

import { useWhatsAppStore } from '@/store/whatsappStore';
import { ROLES, RoleType } from '@/types';

// Define what each role can do
const ROLE_PERMISSIONS: Record<RoleType, string[]> = {
  [ROLES.ADMIN]: [
    'send-message',
    'read-conversations',
    'manage-templates',
    'manage-config',
    'manage-crm',
    'view-logs',
    'manage-users',
    'manage-roles',
  ],
  [ROLES.AGENT]: [
    'send-message',
    'read-conversations',
    'view-contact-info',
  ],
  [ROLES.USER]: [
    'read-conversations',
  ],
  [ROLES.VIEWER]: [
    'read-conversations',
  ],
};

// Define tabs each role can access
const ROLE_TABS: Record<RoleType, string[]> = {
  [ROLES.ADMIN]: ['conversations', 'send', 'templates', 'config', 'crm', 'logs', 'webhook', 'contact'],
  [ROLES.AGENT]: ['conversations', 'send', 'templates', 'contact'],
  [ROLES.USER]: ['conversations', 'contact'],
  [ROLES.VIEWER]: ['conversations'],
};

export function useRbac(userRole?: RoleType) {
  const storeRole = useWhatsAppStore((state) => state.currentRole);
  const currentRole = userRole || storeRole;

  /**
   * Get allowed tabs for current role
   */
  const tabs = (): string[] => {
    if (!currentRole) return ['conversations'];
    return ROLE_TABS[currentRole] || ['conversations'];
  };

  /**
   * Check if current user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!currentRole) return false;
    return ROLE_PERMISSIONS[currentRole]?.includes(permission) ?? false;
  };

  /**
   * Check if current user has any of the given permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!currentRole) return false;
    return permissions.some((p) => ROLE_PERMISSIONS[currentRole]?.includes(p));
  };

  /**
   * Check if current user has all of the given permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!currentRole) return false;
    return permissions.every((p) => ROLE_PERMISSIONS[currentRole]?.includes(p));
  };

  /**
   * Check if current user has a specific role
   */
  const hasRole = (role: RoleType | RoleType[]): boolean => {
    if (!currentRole) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(currentRole);
  };

  /**
   * Check if user can send messages
   */
  const canSend = (): boolean => hasPermission('send-message');

  /**
   * Check if user can view config panel
   */
  const canViewConfig = (): boolean => hasPermission('manage-config');

  /**
   * Check if user can view templates panel
   */
  const canViewTemplates = (): boolean => hasPermission('manage-templates');

  /**
   * Check if user can view CRM panel
   */
  const canViewCrm = (): boolean => hasPermission('manage-crm');

  /**
   * Check if user can view logs
   */
  const canViewLogs = (): boolean => hasPermission('view-logs');

  /**
   * Check if user can view contact info panel
   */
  const canViewContactInfo = (): boolean => hasPermission('view-contact-info');

  return {
    currentRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    canSend,
    canViewConfig,
    canViewTemplates,
    canViewCrm,
    canViewLogs,
    canViewContactInfo,
    tabs,
  };
}
