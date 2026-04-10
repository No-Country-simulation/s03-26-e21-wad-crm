/**
 * WhatsApp CRM - App Component (TypeScript version)
 * Re-exports App.jsx functionality with type safety and role control
 * This is a thin wrapper that preserves 100% existing functionality
 */

import { useEffect } from 'react';
import { useWhatsAppStore } from '@/store/whatsappStore';
import { RoleType, ROLES, TabKey, TABS } from '@/types';
import { useRbac } from '@/hooks/useRbac';
import { LoginPanel } from '@/components/LoginPanel';
import App from './App.jsx';

/**
 * Component to display when user doesn't have permission
 */
function PermissionDenied() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-3xl font-bold text-white mb-2">Acceso Denegado</h1>
        <p className="text-slate-400">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    </div>
  );
}

/**
 * Get allowed tabs based on user role
 */
function getAllowedTabs(role: RoleType | null): TabKey[] {
  if (!role) return [TABS.CONVERSATIONS];

  switch (role) {
    case ROLES.ADMIN:
      // ADMIN can see everything
      return [
        TABS.CONVERSATIONS,
        TABS.SEND,
        TABS.TEMPLATES,
        TABS.CONFIG,
        TABS.CRM,
        TABS.LOGS,
        TABS.WEBHOOK,
      ];

    case ROLES.AGENT:
      // AGENT can send and read conversations
      return [TABS.CONVERSATIONS, TABS.SEND, TABS.TEMPLATES];

    case ROLES.USER:
      // USER can only read conversations
      return [TABS.CONVERSATIONS];

    case ROLES.VIEWER:
      // VIEWER can only read conversations (read-only)
      return [TABS.CONVERSATIONS];

    default:
      return [TABS.CONVERSATIONS];
  }
}

/**
 * Detect role from JWT token or session
 */
function useDetectRole() {
  const setSession = useWhatsAppStore((state) => state.setSession);

  useEffect(() => {
    // Try to get role from token or /me endpoint
    async function detectRole() {
      try {
        // This would normally call /api/me or decode JWT
        // For now, we'll use localStorage or default to USER
        const storedRole = localStorage.getItem('user-role') as RoleType | null;
        if (storedRole) {
          setSession({
            userId: localStorage.getItem('user-id') || 'unknown',
            workspaceId: localStorage.getItem('workspace-id') || 'unknown',
            role: storedRole,
          });
        }
      } catch (error) {
        console.error('Failed to detect role:', error);
      }
    }

    detectRole();
  }, [setSession]);
}

/**
 * Tab guard - prevent navigation to unauthorized tabs
 */
export function TabGuard({
  tabName,
  children,
}: {
  tabName: TabKey;
  children: React.ReactNode;
}) {
  const { currentRole } = useRbac();
  const allowedTabs = getAllowedTabs(currentRole);

  if (!allowedTabs.includes(tabName)) {
    return <PermissionDenied />;
  }

  return <>{children}</>;
}

/**
 * Main App Component
 * Preserves 100% of original App.jsx functionality
 * Adds type safety and role-based access control
 */
export default function AppWithRoles() {
  useDetectRole();
  const { currentRole } = useRbac();

  // If user doesn't have any role, show login
  if (!currentRole) {
    return <LoginPanel />;
  }

  const allowedTabs = getAllowedTabs(currentRole);

  // Pass role and allowedTabs to App.jsx so it can filter UI elements
  // @ts-ignore - App.jsx is not typed, but it works
  return <App currentRole={currentRole} allowedTabs={allowedTabs} />;
}
