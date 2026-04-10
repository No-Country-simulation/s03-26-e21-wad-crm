# RBAC Integration for WhatsApp CRM - Requirements

**Epic**: Startup CRM - WhatsApp Integration  
**Module**: Role-Based Access Control (RBAC)  
**Created**: 2026-04-09  
**Status**: In Progress

---

## Overview

Implement flexible, table-driven Role-Based Access Control (RBAC) system across frontend and backend. Define 4 system roles (ADMIN, AGENT, USER, VIEWER) with granular permissions manageable via CRUD endpoints.

**Key Principle**: NO code-based enums for roles/permissions. Everything is table-driven for maximum flexibility.

---

## Requirements

### 1. Backend RBAC Infrastructure

#### 1.1 Role Entity & Table
- **What**: `roles` table in PostgreSQL
- **Fields**:
  - `id` (UUID, PK)
  - `workspace_id` (UUID, FK to workspaces)
  - `name` (VARCHAR 255, unique per workspace)
  - `description` (VARCHAR 500, optional)
  - `permissions` (TEXT, comma-separated list)
  - `is_system` (BOOLEAN, true for ADMIN/AGENT/USER/VIEWER - cannot be deleted)
  - `is_active` (BOOLEAN, default true)
  - Audit fields: `created_at`, `updated_at`, `created_by`, `updated_by`
- **Constraints**:
  - Unique constraint on (workspace_id, name)
  - Foreign key to workspaces with CASCADE delete
  - Indexes on: workspace_id, is_system, is_active

#### 1.2 System Roles (Initialized on First User Registration)
When a user registers in a workspace, auto-create 4 system roles:

| Role | Permissions | Description |
|------|-------------|-------------|
| **ADMIN** | send-message, read-conversations, manage-templates, manage-config, manage-crm, view-logs, manage-users, manage-roles | Full system access |
| **AGENT** | send-message, read-conversations, view-contact-info | Can send messages and view contacts |
| **USER** | read-conversations | Read-only access to conversations |
| **VIEWER** | read-conversations | Read-only access to conversations (same as USER, reserved for future) |

#### 1.3 Backend APIs (RoleController - ADMIN only)
- `GET /api/roles` - List all roles in workspace (paginated)
- `GET /api/roles/:id` - Get role details
- `POST /api/roles` - Create custom role (ADMIN only)
- `PUT /api/roles/:id` - Update role permissions (ADMIN only)
- `DELETE /api/roles/:id` - Delete role (only if not system role, ADMIN only)

#### 1.4 Authorization on Endpoints
- `POST /api/whatsapp/send` - Requires `@PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")`
- `GET /api/conversations` - Requires `@PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'USER', 'VIEWER')")`
- All other endpoints checked against role permissions

#### 1.5 User-Role Assignment
- User entity has reference to primary `role_id` (FK to roles table)
- On registration, assign default role: USER
- Workspace admins can change user roles via future endpoint

### 2. Frontend RBAC Implementation

#### 2.1 useRbac Hook
TypeScript hook providing permission checking utilities:
```typescript
const { 
  currentRole,           // RoleType | null
  hasPermission,         // (permission: string) => boolean
  hasAnyPermission,      // (permissions: string[]) => boolean
  hasAllPermissions,     // (permissions: string[]) => boolean
  hasRole,               // (role: RoleType | RoleType[]) => boolean
  canSend,               // () => boolean
  canViewConfig,         // () => boolean
  canViewTemplates,      // () => boolean
  canViewCrm,            // () => boolean
  canViewLogs,           // () => boolean
  canViewContactInfo,    // () => boolean
} = useRbac()
```

#### 2.2 Zustand Store (whatsappStore)
State management for:
- `session: UserSession | null` - Current user's session + role
- `currentRole: RoleType | null` - Cached current role
- `selectedContactId: string | null` - For ContactInfoPanel
- `showContactPanel: boolean` - ContactInfoPanel visibility
- Helper methods: `setSession()`, `setSelectedContactId()`, `setShowContactPanel()`

#### 2.3 Tab Visibility Guards (RBAC by Role)

| Tab | ADMIN | AGENT | USER | VIEWER |
|-----|-------|-------|------|--------|
| Conversations | ✅ | ✅ | ✅ | ✅ |
| Send | ✅ | ✅ | ❌ | ❌ |
| Templates | ✅ | ✅ | ❌ | ❌ |
| Config | ✅ | ❌ | ❌ | ❌ |
| CRM | ✅ | ❌ | ❌ | ❌ |
| Logs | ✅ | ❌ | ❌ | ❌ |
| Webhook | ✅ | ❌ | ❌ | ❌ |

#### 2.4 ContactInfoPanel Integration
- Right-side panel (320px fixed width)
- Opens on click of contact name in ConversationsPanel header
- Only visible for ADMIN and AGENT roles
- Features:
  - **View mode**: Display contact name, phone, ID
  - **Edit mode**: Form to update contact info (TODO: PUT /api/contacts/:id)
  - View/Edit toggle button
  - Close button

#### 2.5 Components Structure
```
src/
├── components/
│   └── panels/
│       ├── ConversationsPanel.jsx (integrates ContactInfoPanel)
│       ├── ContactInfoPanel.tsx (NEW - side panel)
│       ├── SendPanel.jsx
│       ├── TemplatesPanel.jsx
│       ├── ConfigPanel.jsx
│       ├── CrmPanel.jsx
│       └── LogsPanel.jsx
├── hooks/
│   └── useRbac.ts (NEW - permission checking)
├── store/
│   └── whatsappStore.ts (updated with contact panel state)
└── types/
    └── index.ts (RoleType, ROLES constant)
```

### 3. Types & Constants

#### 3.1 RoleType
```typescript
type RoleType = 'ADMIN' | 'AGENT' | 'USER' | 'VIEWER'

const ROLES = {
  ADMIN: 'ADMIN',
  AGENT: 'AGENT',
  USER: 'USER',
  VIEWER: 'VIEWER',
}
```

#### 3.2 UserSession
```typescript
interface UserSession {
  userId: string
  workspaceId: string
  role: RoleType
  accessToken?: string
  refreshToken?: string
}
```

#### 3.3 Contact
```typescript
interface Contact {
  id: string
  name: string
  phone: string
  // email?: string (future)
}
```

---

## Acceptance Criteria

### AC1: Backend Role Table Created
```gherkin
Given a new deployment starts
When the application initializes with Flyway
Then the roles table exists with all required columns
And indexes are created for performance
```

### AC2: System Roles Auto-Initialized
```gherkin
Given a user registers in a workspace
When registration completes
Then 4 system roles (ADMIN, AGENT, USER, VIEWER) are created automatically
And user is assigned default role: USER
```

### AC3: RBAC Guards on Endpoints
```gherkin
Given an AGENT user
When they POST /api/whatsapp/send
Then request succeeds with 200
And message is sent

Given a USER user
When they POST /api/whatsapp/send
Then request fails with 403 Forbidden
```

### AC4: Frontend Tab Visibility
```gherkin
Given an ADMIN user
When they login
Then all 7 tabs are visible (Conversations, Send, Templates, Config, CRM, Logs, Webhook)

Given an AGENT user
When they login
Then only 3 tabs are visible (Conversations, Send, Templates)

Given a USER user
When they login
Then only 1 tab is visible (Conversations)
```

### AC5: ContactInfoPanel Shows for ADMIN/AGENT
```gherkin
Given a ConversationsPanel with selected conversation
When user clicks on contact name
Then ContactInfoPanel opens (if ADMIN or AGENT)
And ContactInfoPanel remains closed (if USER or VIEWER)
```

### AC6: RBAC Hook Provides Accurate Permissions
```gherkin
Given an AGENT user
When calling useRbac().canSend()
Then returns true

When calling useRbac().canViewConfig()
Then returns false
```

---

## Future Enhancements

- [ ] Custom role creation (ADMIN can define new roles)
- [ ] User role assignment endpoint
- [ ] Email field in Contact
- [ ] ContactInfoPanel API integration (PUT /api/contacts/:id)
- [ ] Audit logging for role changes
- [ ] Role hierarchy (parent-child roles)
- [ ] Permission templates

---

## Notes

- **No enums in code**: All roles/permissions are table-driven
- **Workspace-scoped**: Roles are per-workspace, different workspaces have different roles
- **System roles immutable**: ADMIN, AGENT, USER, VIEWER cannot be deleted, only custom roles can
- **Permission strings**: Comma-separated for flexibility (e.g., "send-message,read-conversations")
