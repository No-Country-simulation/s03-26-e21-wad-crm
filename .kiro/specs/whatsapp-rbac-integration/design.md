# RBAC Integration - Technical Design

**Module**: Role-Based Access Control (RBAC)  
**Status**: Design Complete  
**Date**: 2026-04-09

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  App.tsx (Role Detection) → useRbac Hook → Component Guards     │
│          ↓                      ↓                                 │
│  Zustand Store ────────── Contact Panel State                   │
│   (session, role)                                                │
│          ↓                                                        │
│  Tab Visibility ──────→ ConversationsPanel ──→ ContactInfoPanel │
│  (getAllowedTabs)       (integrates panel)       (view/edit)     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                               ↑ (API Calls)
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Spring Boot)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  AuthService (Register) ──→ RoleService.initializeSystemRoles() │
│                           ├─ Create ADMIN role                   │
│                           ├─ Create AGENT role                   │
│                           ├─ Create USER role (default)          │
│                           └─ Create VIEWER role                  │
│                                                                   │
│  RoleController (REST API - ADMIN only)                         │
│  ├─ GET    /api/roles (list)                                    │
│  ├─ GET    /api/roles/:id (get)                                 │
│  ├─ POST   /api/roles (create custom)                           │
│  ├─ PUT    /api/roles/:id (update)                              │
│  └─ DELETE /api/roles/:id (delete custom)                       │
│                                                                   │
│  WhatsAppController                                              │
│  ├─ POST /api/whatsapp/send                                      │
│  │  @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")               │
│  │                                                                │
│  └─ GET /api/conversations                                       │
│     @PreAuthorize("hasAnyRole(...)")                             │
│                                                                   │
│  Database (PostgreSQL)                                            │
│  ├─ roles (id, workspace_id, name, permissions, is_system)      │
│  └─ users (id, workspace_id, role_id → FK roles)                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Design

### Frontend: useRbac Hook

**Location**: `src/hooks/useRbac.ts`

**Purpose**: Centralized permission checking logic

**Implementation**:
```typescript
export function useRbac() {
  const currentRole = useWhatsAppStore(state => state.currentRole)
  
  // Permission matrix (role → permissions mapping)
  const ROLE_PERMISSIONS: Record<RoleType, string[]> = {
    ADMIN: [...all permissions...],
    AGENT: [send-message, read-conversations, view-contact-info],
    USER: [read-conversations],
    VIEWER: [read-conversations],
  }
  
  return {
    hasPermission(perm) { },      // Single permission check
    hasAnyPermission(perms) { },   // OR logic
    hasAllPermissions(perms) { },  // AND logic
    hasRole(role) { },             // Role-based check
    canSend() { },                 // Convenience methods
    canViewConfig() { },
    ...
  }
}
```

**Usage in Components**:
```typescript
const { canSend, currentRole } = useRbac()

return canSend() ? <SendPanel /> : <PermissionDenied />
```

### Frontend: Zustand Store

**Location**: `src/store/whatsappStore.ts`

**State Shape**:
```typescript
interface WhatsAppStore {
  // Session & Role
  session: UserSession | null
  setSession(session) { }
  currentRole: RoleType | null
  
  // Contact Panel (NEW)
  selectedContactId: string | null
  setSelectedContactId(id) { }
  showContactPanel: boolean
  setShowContactPanel(show) { }
  
  // Existing state...
  config, templates, conversations, etc.
}
```

**Persistence**: Zustand persist middleware saves to localStorage

### Frontend: App.tsx Role Detection

**Location**: `src/App.tsx`

**Flow**:
1. On mount, `useDetectRole()` runs
2. Reads `user-role`, `user-id`, `workspace-id` from localStorage
3. Calls `setSession()` to update Zustand store
4. `currentRole` becomes available throughout app

**Tab Guard**:
```typescript
export function TabGuard({ tabName, children }) {
  const { currentRole } = useRbac()
  const allowed = getAllowedTabs(currentRole)
  
  if (!allowed.includes(tabName)) {
    return <PermissionDenied />
  }
  return <>{children}</>
}
```

**Tab Visibility Logic**:
```typescript
function getAllowedTabs(role: RoleType | null): TabKey[] {
  switch (role) {
    case ROLES.ADMIN:
      return [CONVERSATIONS, SEND, TEMPLATES, CONFIG, CRM, LOGS, WEBHOOK]
    case ROLES.AGENT:
      return [CONVERSATIONS, SEND, TEMPLATES]
    case ROLES.USER:
    case ROLES.VIEWER:
      return [CONVERSATIONS]
  }
}
```

### Frontend: ContactInfoPanel Integration

**Location**: `src/components/panels/ContactInfoPanel.tsx` (NEW)

**Props**:
```typescript
interface ContactInfoPanelProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
}
```

**Features**:
- Fixed right panel (320px)
- Only renders if `isOpen && contact && (ADMIN || AGENT)`
- Two modes:
  - **View**: Display name, phone, ID (read-only)
  - **Edit**: Form with inputs to update contact (TODO: API integration)

**Integration in ConversationsPanel**:
```jsx
// In ConversationsPanel.jsx
const [showContactPanel, setShowContactPanel] = useState(false)
const [selectedContact, setSelectedContact] = useState(null)

// Click handler on contact name
onClick={() => {
  setSelectedContact(contacts[contactId])
  setShowContactPanel(true)
}}

// At end of return:
<ContactInfoPanel
  isOpen={showContactPanel}
  onClose={() => setShowContactPanel(false)}
  contact={selectedContact}
/>
```

---

## Backend Design

### Database Schema

**Table: roles**
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  permissions TEXT,           -- comma-separated
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  CONSTRAINT fk_roles_workspace FOREIGN KEY (workspace_id),
  CONSTRAINT uq_roles_workspace_name UNIQUE (workspace_id, name)
)
```

**Indexes**:
- `idx_roles_workspace_id` (frequent lookups)
- `idx_roles_is_system` (filtering system roles)
- `idx_roles_is_active` (filtering active roles)

**Migration**: `V16__create_roles_table.sql` (Flyway)

### Service Layer: RoleService

**Location**: `server/src/main/java/com/crm/module/user/service/RoleService.java`

**Key Methods**:
```java
public void initializeSystemRoles(UUID workspaceId) {
  // Called from AuthService.register()
  // Creates 4 system roles if not exist
}

public Role getRoleByName(UUID workspaceId, String name) { }
public List<Role> getRolesByWorkspace(UUID workspaceId) { }
public Role createCustomRole(CreateRoleRequest dto) { }
public void updateRolePermissions(UUID roleId, UpdatePermissionsRequest dto) { }
public void deleteCustomRole(UUID roleId) { }
```

**Role Initialization on Register**:
```java
// In AuthService.register()
@Autowired private RoleService roleService

public User register(RegisterRequest dto) {
  User user = new User(...)
  user.setRole(roleService.getRoleByName(workspaceId, "USER"))
  
  // Initialize system roles on first user
  roleService.initializeSystemRoles(workspaceId)
  
  return userRepository.save(user)
}
```

### Authorization: Spring Security

**Endpoint Protection**:
```java
@PostMapping("/api/whatsapp/send")
@PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
public ResponseEntity<?> sendMessage(@RequestBody MessageRequest dto) {
  // Only ADMIN or AGENT can send
}

@GetMapping("/api/conversations")
@PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'USER', 'VIEWER')")
public ResponseEntity<?> getConversations() {
  // All authenticated roles can read
}
```

**Custom Annotation** (future):
```java
@RoleRequired(roles = {"ADMIN", "AGENT"})
public ResponseEntity<?> sendMessage() { }
```

### REST API: RoleController

**Location**: `server/src/main/java/com/crm/module/user/controller/RoleController.java`

**Endpoints** (ADMIN only):
```
GET    /api/roles                    List roles in workspace
GET    /api/roles/:id                Get role details
POST   /api/roles                    Create custom role
PUT    /api/roles/:id                Update role permissions
DELETE /api/roles/:id                Delete custom role (not system)
```

**Request/Response DTOs**:
```java
@Data
public class RoleDto {
  UUID id;
  String name;
  String description;
  List<String> permissions;
  Boolean isSystem;
  Boolean isActive;
}

@Data
public class CreateRoleRequest {
  String name;
  String description;
  List<String> permissions;
}

@Data
public class UpdatePermissionsRequest {
  List<String> permissions;
}
```

---

## Data Flow

### 1. User Registration Flow
```
User registers (AuthController.register)
    ↓
AuthService.register()
    ├─ Create User entity
    ├─ Set role = "USER"
    ├─ Call roleService.initializeSystemRoles(workspaceId)
    │  └─ Creates ADMIN, AGENT, USER, VIEWER if not exist
    └─ Save user to DB
    ↓
User gets JWT token
    ├─ JWT contains: userId, workspaceId, role
    └─ Frontend stores token in localStorage
```

### 2. Frontend Role Detection Flow
```
App loads (App.tsx)
    ↓
useDetectRole() hook runs
    ├─ Read localStorage: user-role, user-id, workspace-id
    ├─ Call useWhatsAppStore().setSession()
    └─ currentRole is now available
    ↓
useRbac() can now check permissions
    ├─ currentRole from store
    └─ ROLE_PERMISSIONS matrix
```

### 3. Send Message Authorization Flow
```
User clicks "Send" button (SendPanel)
    ├─ useRbac().canSend() → checks if ADMIN or AGENT
    │  └─ If false: button disabled or shows "Unauthorized"
    ├─ If authorized: POST /api/whatsapp/send
    │  └─ JWT token in Authorization header
    ↓
Backend receives request
    ├─ Spring Security extracts JWT
    ├─ Gets user role from JWT
    ├─ @PreAuthorize checks: hasAnyRole('ADMIN', 'AGENT')
    └─ If authorized: process message
       If denied: return 403 Forbidden
```

### 4. ContactInfoPanel Flow
```
User clicks contact name in ConversationsPanel header
    ├─ Check: currentRole === ADMIN || AGENT?
    │  └─ If false: don't show panel
    ├─ If true: setSelectedContact() + setShowContactPanel(true)
    ↓
ContactInfoPanel renders
    ├─ Shows contact info in view mode
    ├─ User can click "Edit Contact"
    ├─ Switches to edit mode with form
    └─ (TODO) On save: PUT /api/contacts/:id
```

---

## Key Design Decisions

### 1. **Table-Driven Roles (NO Enums)**
**Decision**: Use `roles` table instead of Java enum

**Why**:
- ✅ Flexibility - admins can create custom roles without code changes
- ✅ Workspace-scoped - different workspaces can have different role sets
- ✅ Backend and frontend don't need to redeploy for role changes
- ❌ Slightly more complex initial setup

**Alternative**: Use enum (rejected - inflexible)

### 2. **Comma-Separated Permissions in Single Column**
**Decision**: Store permissions as "send-message,read-conversations" string

**Why**:
- ✅ Simple schema - no junction table needed
- ✅ Easy serialization to/from JSON
- ✅ Atomic permission string per role
- ❌ Not as normalized as separate table

**Alternative**: Create `role_permissions` junction table (rejected - overkill for MVP)

### 3. **System Roles Immutable**
**Decision**: Mark ADMIN, AGENT, USER, VIEWER as `is_system=true`, cannot delete

**Why**:
- ✅ Core roles always available
- ✅ Prevents accidental deletion breaking app
- ✅ Clear contract for developers

**Alternative**: Allow deletion (rejected - dangerous)

### 4. **Role Detection on Frontend from localStorage**
**Decision**: Store and read role from localStorage, no API call on every page load

**Why**:
- ✅ Fast - no network latency
- ✅ Role stays same throughout session (if not logged out)
- ✅ Role is already in JWT (could decode it)
- ❌ Requires backend to set it on login

**Alternative**: Call /api/me on every app load (rejected - wasteful)

### 5. **useRbac Hook for Permission Checking**
**Decision**: Create custom hook with permission matrix vs. scattered @PreAuthorize checks

**Why**:
- ✅ Centralized permission logic
- ✅ Reusable across components
- ✅ Easy to test: `useRbac().canSend()` returns boolean
- ✅ Clear intent in component code

**Alternative**: Inline permission checks in every component (rejected - repetitive)

---

## Correctness Properties

### P1: System Roles Always Exist
```
FOR ALL workspaceId:
  initializeSystemRoles(workspaceId) is idempotent
  RESULT: roles named ADMIN, AGENT, USER, VIEWER exist
  AND: is_system = true
  AND: are_active = true
```

### P2: User Assigned Valid Role on Register
```
WHEN user.register(email, password):
  RESULT: user.role != null
  AND: user.role.is_system = true
  AND: user.role.name IN [ADMIN, AGENT, USER, VIEWER]
```

### P3: RBAC Checks Prevent Unauthorized Actions
```
WHEN user.role = USER
  AND user attempts POST /api/whatsapp/send:
  RESULT: response.status = 403 Forbidden
```

### P4: Tab Visibility Matches Permission Level
```
WHEN user.role = AGENT:
  RESULT: getAllowedTabs() = [CONVERSATIONS, SEND, TEMPLATES]
  AND: CONFIG tab not rendered
  AND: CRM tab not rendered
```

### P5: ContactInfoPanel Only Shows for ADMIN/AGENT
```
WHEN contactPanel.isOpen = true
  AND user.role = USER:
  RESULT: ContactInfoPanel returns null (nothing renders)
  
WHEN user.role = ADMIN:
  RESULT: ContactInfoPanel renders with full content
```

---

## Testing Strategy

### Backend Tests
- Unit: RoleService.initializeSystemRoles() creates 4 roles
- Integration: AuthService.register() creates user with USER role
- Security: WhatsAppController.send() returns 403 for USER role

### Frontend Tests
- useRbac().canSend() returns true for AGENT
- getAllowedTabs(ADMIN).includes(TABS.CONFIG) === true
- ContactInfoPanel returns null when currentRole === USER
- Tab visibility updates when role changes

---

## Migration & Rollout

### Step 1: Flyway Migration
- V16__create_roles_table.sql runs on app startup
- Creates `roles` table with indexes

### Step 2: First User Registration
- AuthService.register() calls roleService.initializeSystemRoles()
- ADMIN, AGENT, USER, VIEWER created
- User assigned USER role

### Step 3: Frontend Deployment
- App.tsx detects role from localStorage
- useRbac() provides permission checks
- Tab visibility controlled by role

### Step 4: Gradual Tab Migration
- Some tabs already use TabGuard wrapper
- Other tabs migrated as components are updated

---

## Future Enhancements

1. **API Integration for Contact Edit**
   - Implement PUT /api/contacts/:id endpoint
   - ContactInfoPanel calls it on save
   - Show toast on success/error

2. **User Role Assignment**
   - Create endpoint: PUT /api/users/:id/role
   - ADMIN can change user roles
   - Audit log role changes

3. **Custom Role Creation**
   - ADMIN can define new roles via UI
   - Add/remove permissions from existing roles
   - Export/import role definitions

4. **Permission Templates**
   - Predefined permission sets
   - Quick role creation from templates

5. **Audit Logging**
   - Log all role changes
   - Who changed what, when
   - Rollback capability

---
